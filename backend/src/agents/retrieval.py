"""
backend/src/agents/retrieval.py
─────────────────────────────────────────────────────────────────────────────
RetrievalAgent — semantic search over the ChromaDB catalog.
No LLM call; pure vector-retrieval + arithmetic.
"""

from __future__ import annotations

import logging

from src.core.state import AgentThought, CartItem, CartState
from src.tools.vector_store import search_catalog

logger = logging.getLogger(__name__)

_TOP_K_PER_QUERY = 4


def _cart_total(cart_items: list[CartItem]) -> float:
    return sum(item.price for item in cart_items)


def retrieval_node(state: CartState) -> dict:
    cart_items: list[CartItem] = state.get("cart_items", [])
    constraints = state.get("constraints")
    missing_essentials: list[str] = state.get("missing_essentials", [])
    inferred_intent: str = state.get("inferred_intent", "General Shopping")
    price_ceiling_override: float | None = state.get("price_ceiling")
    thought_log: list[AgentThought] = list(state.get("thought_log", []))
    iteration: int = state.get("iteration_count", 0)

    cart_total = _cart_total(cart_items)
    budget_cap: float = constraints.budget_cap if constraints else float("inf")
    remaining_budget = budget_cap - cart_total

    effective_ceiling = (
        min(remaining_budget, price_ceiling_override)
        if price_ceiling_override is not None
        else remaining_budget
    )

    thought_log.append(AgentThought(
        agent="RetrievalAgent",
        message=(
            f"[Iteration {iteration + 1}] Budget remaining: ${remaining_budget:.2f}. "
            f"Price ceiling: ${effective_ceiling:.2f}. "
            f"Searching for: {missing_essentials or ['broad intent match']}."
        ),
    ))

    existing_ids: list[str] = [item.id for item in cart_items]
    queries: list[str] = list(missing_essentials)
    if inferred_intent and inferred_intent != "General Shopping":
        queries.append(inferred_intent)

    seen_ids: set[str] = set(existing_ids)
    candidates: list[CartItem] = []

    for query in queries:
        if effective_ceiling <= 0:
            thought_log.append(AgentThought(
                agent="RetrievalAgent",
                message="Remaining budget is zero or negative — skipping retrieval.",
            ))
            break

        results = search_catalog(
            query=query,
            top_k=_TOP_K_PER_QUERY,
            max_price=effective_ceiling if effective_ceiling < float("inf") else None,
            exclude_ids=list(seen_ids),
        )

        new_results = [r for r in results if r.id not in seen_ids]
        for item in new_results:
            seen_ids.add(item.id)
            candidates.append(item)

    thought_log.append(AgentThought(
        agent="RetrievalAgent",
        message=(
            f"Retrieved {len(candidates)} candidate item(s): "
            f"{[c.name for c in candidates[:6]]}{'…' if len(candidates) > 6 else ''}."
        ),
    ))

    return {"candidate_items": candidates, "thought_log": thought_log}
