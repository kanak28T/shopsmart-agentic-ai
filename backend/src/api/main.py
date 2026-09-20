"""
backend/src/api/main.py
─────────────────────────────────────────────────────────────────────────────
FastAPI bridge between the React frontend and the LangGraph pipeline.

Endpoints
  POST /recommend   — accepts React cart payload, runs graph, returns JSON
  GET  /health      — liveness probe

Payload shape (from agentService.js)
  {
    "cart_items": [
      { "id": "mic-001", "name": "...", "category": "...",
        "price": 99.0, "tags": [...], "specs": {...} }
    ],
    "budget": 500.0,
    "restrictions": "Sony, latex"   // comma-separated string
  }

Response shape (consumed by Recommendations.jsx via result object)
  {
    "inferred_intent":  "Podcasting Studio Setup",
    "intent_emoji":     "🎙️",
    "intent_accent":    "from-violet-500 to-fuchsia-500",
    "recommendations": [
      {
        "id":            "acc-003",
        "name":          "Pop Filter Microphone Shield",
        "price":         14.99,
        "image":         "https://...",
        "rating":        4.5,
        "reviews":       1200,
        "justification": "...",
        "confidence":    0.92,
        "matchPct":      92,
        "subcategory":   "pop_filter",
        "tags":          [...]
      }
    ],
    "thought_log": [
      { "agent": "IntentAgent", "emoji": "🧠", "color": "violet",
        "step": "Intent inferred", "detail": "..." }
    ],
    "budget_remaining": 385.01
  }

LangSmith tracing is auto-enabled when LANGCHAIN_TRACING_V2=true in .env.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load .env from the backend directory (one level up from src/api/)
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_ROOT / ".env")

from src.core.graph import run_graph
from src.core.state import CartItem, UserConstraints

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ─── Load product image map from catalog.json for response enrichment ─────────
_CATALOG_PATH = _BACKEND_ROOT / "data" / "catalog.json"
_CATALOG_MAP: dict[str, dict] = {}

try:
    with open(_CATALOG_PATH, "r", encoding="utf-8") as _fh:
        for _row in json.load(_fh):
            _CATALOG_MAP[_row["id"]] = _row
except Exception as _e:
    logger.warning("Could not load catalog for image map: %s", _e)


# ─── Intent → emoji/accent mapping (mirrors the JS agentService.js) ───────────
_INTENT_META: list[dict] = [
    {
        "keywords": ["podcast", "studio", "microphone", "recording", "audio"],
        "emoji": "🎙️",
        "accent": "from-violet-500 to-fuchsia-500",
    },
    {
        "keywords": ["backpack", "trek", "hiking", "camping", "outdoor"],
        "emoji": "🏔️",
        "accent": "from-emerald-500 to-teal-500",
    },
    {
        "keywords": ["gym", "fitness", "workout", "exercise", "yoga"],
        "emoji": "💪",
        "accent": "from-orange-500 to-rose-500",
    },
    {
        "keywords": ["gaming", "game", "console", "esports", "stream"],
        "emoji": "🎮",
        "accent": "from-indigo-500 to-blue-500",
    },
    {
        "keywords": ["content", "creator", "vlog", "camera", "video"],
        "emoji": "🎥",
        "accent": "from-pink-500 to-purple-500",
    },
    {
        "keywords": ["diy", "electronics", "raspberry", "arduino", "iot"],
        "emoji": "🤖",
        "accent": "from-cyan-500 to-sky-500",
    },
    {
        "keywords": ["travel", "trip", "portable", "pack", "adapter"],
        "emoji": "✈️",
        "accent": "from-amber-500 to-orange-500",
    },
]

_DEFAULT_META = {"emoji": "🛒", "accent": "from-slate-500 to-slate-700"}


def _intent_meta(intent_label: str) -> dict:
    label_lower = intent_label.lower()
    for meta in _INTENT_META:
        if any(kw in label_lower for kw in meta["keywords"]):
            return {"emoji": meta["emoji"], "accent": meta["accent"]}
    return _DEFAULT_META


# ─── Agent colour map for thought_log ─────────────────────────────────────────
_AGENT_COLOR = {
    "IntentAgent": ("🧠", "violet"),
    "RetrievalAgent": ("🔍", "sky"),
    "GuardrailAgent": ("🛡️", "emerald"),
}


def _format_thought_log(raw_log: list) -> list[dict]:
    """Convert AgentThought objects to the shape AgentTraceLog.jsx expects."""
    formatted = []
    for entry in raw_log:
        agent = entry.agent if hasattr(entry, "agent") else entry.get("agent", "Agent")
        message = entry.message if hasattr(entry, "message") else entry.get("message", "")
        emoji, color = _AGENT_COLOR.get(agent, ("💡", "violet"))

        # Split "Step name: detail" if colon present, else use full message as detail
        if ":" in message:
            step, _, detail = message.partition(":")
            step = step.strip()
            detail = detail.strip()
        else:
            step = agent
            detail = message

        formatted.append({
            "agent": agent,
            "emoji": emoji,
            "color": color,
            "step": step,
            "detail": detail,
        })
    return formatted


# ─── Request / Response models ─────────────────────────────────────────────────

class CartItemPayload(BaseModel):
    id: str
    name: str
    category: str
    price: float
    tags: list[str] = Field(default_factory=list)
    specs: dict[str, Any] = Field(default_factory=dict)
    # Frontend extras we accept but don't pass to the pipeline
    subcategory: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    description: Optional[str] = None


class RecommendRequest(BaseModel):
    cart_items: list[CartItemPayload]
    budget: float = Field(..., gt=0)
    restrictions: str = ""   # comma-separated string from CartPanel


class RecommendationOut(BaseModel):
    id: str
    name: str
    price: float
    image: str
    rating: float
    reviews: int
    justification: str
    confidence: float
    matchPct: int
    subcategory: str
    tags: list[str]
    category: str


class RecommendResponse(BaseModel):
    inferred_intent: str
    intent_emoji: str
    intent_accent: str
    recommendations: list[RecommendationOut]
    thought_log: list[dict]
    budget_remaining: float


# ─── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="ShopSmart AI Backend",
    description="LangGraph multi-agent recommendation engine",
    version="1.0.0",
)

# Allow the Vite dev server (port 5173) and any production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",   # vite preview
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "shopsmart-backend"}


@app.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    Run the LangGraph Intent → Retrieval → Guardrail pipeline and return
    structured recommendations in the shape the React frontend expects.
    """
    # Build CartItem objects for the pipeline
    cart_items = [
        CartItem(
            id=item.id,
            name=item.name,
            category=item.category,
            price=item.price,
            tags=item.tags,
            specs=item.specs,
        )
        for item in req.cart_items
    ]

    # Parse comma-separated restrictions string
    restriction_list = [
        r.strip() for r in req.restrictions.split(",") if r.strip()
    ]

    constraints = UserConstraints(
        budget_cap=req.budget,
        dietary_or_brand_restrictions=restriction_list,
    )

    try:
        final_state = run_graph(cart_items=cart_items, constraints=constraints)
    except Exception as exc:
        logger.exception("Graph execution failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Agent pipeline error: {exc}") from exc

    # Compute budget remaining
    cart_total = sum(item.price for item in cart_items)
    budget_remaining = max(0.0, req.budget - cart_total)

    # Build recommendation output — enrich with catalog image/rating data
    recs_out: list[RecommendationOut] = []
    for rec in final_state.get("recommendations", []):
        catalog_row = _CATALOG_MAP.get(rec.item_id, {})
        recs_out.append(RecommendationOut(
            id=rec.item_id,
            name=rec.name,
            price=rec.price,
            image=catalog_row.get(
                "image",
                f"https://picsum.photos/seed/{rec.item_id}/500/500",
            ),
            rating=catalog_row.get("rating", 4.5),
            reviews=catalog_row.get("reviews", 100),
            justification=rec.justification,
            confidence=rec.confidence_score,
            matchPct=round(rec.confidence_score * 100),
            subcategory=catalog_row.get("subcategory", ""),
            tags=catalog_row.get("tags", []),
            category=catalog_row.get("category", rec.name),
        ))

    # Format intent metadata
    inferred_intent = final_state.get("inferred_intent", "General Shopping")
    meta = _intent_meta(inferred_intent)

    return RecommendResponse(
        inferred_intent=inferred_intent,
        intent_emoji=meta["emoji"],
        intent_accent=meta["accent"],
        recommendations=recs_out,
        thought_log=_format_thought_log(final_state.get("thought_log", [])),
        budget_remaining=budget_remaining,
    )
