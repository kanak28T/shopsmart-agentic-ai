"""
backend/src/tools/vector_store.py
─────────────────────────────────────────────────────────────────────────────
ChromaDB vector store backed by sentence-transformers/all-MiniLM-L6-v2.
In-memory by default; set CHROMA_PERSIST=true in .env for disk persistence.
"""

from __future__ import annotations

import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from dotenv import load_dotenv

from src.core.state import CartItem

load_dotenv()
logger = logging.getLogger(__name__)

# Catalog lives at backend/data/catalog.json
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_CATALOG_PATH = _BACKEND_ROOT / "data" / "catalog.json"

_COLLECTION_NAME = "product_catalog"
_EMBEDDING_MODEL = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _get_client() -> chromadb.Client:
    persist = os.getenv("CHROMA_PERSIST", "false").lower() == "true"
    if persist:
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        logger.info("ChromaDB: persistent mode → %s", persist_dir)
        return chromadb.PersistentClient(path=persist_dir)
    logger.info("ChromaDB: in-memory mode")
    return chromadb.EphemeralClient()


@lru_cache(maxsize=1)
def _get_collection() -> chromadb.Collection:
    client = _get_client()
    ef = SentenceTransformerEmbeddingFunction(model_name=_EMBEDDING_MODEL)

    existing = [c.name for c in client.list_collections()]
    if _COLLECTION_NAME in existing:
        col = client.get_collection(name=_COLLECTION_NAME, embedding_function=ef)
        if col.count() > 0:
            logger.info("ChromaDB: reusing existing collection (%d docs)", col.count())
            return col
        client.delete_collection(_COLLECTION_NAME)

    col = client.create_collection(
        name=_COLLECTION_NAME,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )
    _ingest_catalog(col)
    return col


def _ingest_catalog(collection: chromadb.Collection) -> None:
    if not _CATALOG_PATH.exists():
        raise FileNotFoundError(f"Catalog not found: {_CATALOG_PATH}")

    with open(_CATALOG_PATH, "r", encoding="utf-8") as fh:
        raw: list[dict] = json.load(fh)

    items = [CartItem(**row) for row in raw]
    documents = [item.to_embedding_text() for item in items]
    ids = [item.id for item in items]
    metadatas = [
        {
            "name": item.name,
            "category": item.category,
            "price": item.price,
            "tags": ",".join(item.tags),
            "specs_json": json.dumps(item.specs),
        }
        for item in items
    ]

    collection.upsert(documents=documents, ids=ids, metadatas=metadatas)
    logger.info("ChromaDB: ingested %d products", len(items))


def search_catalog(
    query: str,
    top_k: int = 5,
    max_price: Optional[float] = None,
    exclude_ids: Optional[list[str]] = None,
) -> list[CartItem]:
    collection = _get_collection()
    exclude_ids = exclude_ids or []

    where: dict | None = None
    if max_price is not None:
        where = {"price": {"$lte": max_price}}

    n_results = min(top_k + len(exclude_ids) + 5, collection.count())
    if n_results == 0:
        return []

    query_kwargs: dict = {
        "query_texts": [query],
        "n_results": n_results,
        "include": ["metadatas", "distances", "documents"],
    }
    if where:
        query_kwargs["where"] = where

    results = collection.query(**query_kwargs)

    items: list[CartItem] = []
    for meta, item_id in zip(
        results.get("metadatas", [[]])[0],
        results.get("ids", [[]])[0],
    ):
        if item_id in exclude_ids:
            continue
        try:
            specs = json.loads(meta.get("specs_json", "{}"))
            item = CartItem(
                id=item_id,
                name=meta["name"],
                category=meta["category"],
                price=float(meta["price"]),
                tags=meta.get("tags", "").split(",") if meta.get("tags") else [],
                specs=specs,
            )
            items.append(item)
        except Exception as exc:
            logger.warning("Skipping malformed entry %s: %s", item_id, exc)

        if len(items) >= top_k:
            break

    return items


def get_all_catalog_items() -> list[CartItem]:
    if not _CATALOG_PATH.exists():
        return []
    with open(_CATALOG_PATH, "r", encoding="utf-8") as fh:
        raw: list[dict] = json.load(fh)
    _get_collection()  # warm cache
    return [CartItem(**row) for row in raw]
