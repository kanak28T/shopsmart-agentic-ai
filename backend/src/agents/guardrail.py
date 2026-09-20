"""
backend/src/agents/guardrail.py
─────────────────────────────────────────────────────────────────────────────
GuardrailAgent — budget validation, restriction filtering, deduplication,
loop control, and LLM-generated justifications.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from dotenv import load_dotenv
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage

from src.core.state import AgentThought, CartItem, CartState, Recommendation
from src.tools.web_search import check_discount

load_dotenv()
logger = logging.getLogger(__name__)

_MAX_ITERATIONS: int = int(os.getenv("MAX_GRAPH_ITERATIONS", "3"))
_BUDGET_TIGHTEN_FACTOR: float = 0.75

_JUSTIFICATION_SYSTEM_PROMPT = """You are a concise shopping assistant.
Given the user's shopping intent and their cart, write ONE sentence explaining WHY
the recommended product perfectly complements the cart.
Keep it under 20 words. Be specific about the synergy.
Return ONLY the sentence — no preamble, no quotes."""


def _build_llm() -> BaseChatModel:
    google_key = os.getenv("GOOGLE_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if google_key:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", temperature=0.3, google_api_key=google_key,
        )
    elif openai_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model="gpt-4o-mini", temperature=0.3, openai_api_key=openai_key)
    else:
        raise EnvironmentError("No LLM API key found.")


def _cart_total(cart_items: list[CartItem]) -> float:
    return sum(item.price for item in cart_items)


def _is_restricted(item: CartItem, restrictions: list[str]) -> bool:
    text = (item.name + " " + " ".join(item.tags)).lower()
    return any(r in text for r in restrictions)


def _get_justification(
    llm: BaseChatModel, item: CartItem, intent: str, cart_items: list[CartItem],
) -> str:
    cart_names = ", ".join(i.name for i in cart_items[:5]) or "empty cart"
    user_msg = (
        f"Shopping intent: {intent}\n"
        f"Cart items: {cart_names}\n"
        f"Recommended product: {item.name} (Category: {item.category}, "
        f"Tags: {', '.join(item.tags[:5])})"
    )
    try:
        response = llm.invoke([
            SystemMessage(content=_JUSTIFICATION_SYSTEM_PROMPT),
            HumanMessage(content=user_msg),
        ])
        return str(response.content).strip()
    except Exception as exc:
        logger.warning("Justification LLM call failed for %s: %s", item.name, exc)
        return f"Complements your {intent} setup."


def guardrail_node(state: CartState) -> dict:
    cart_items: list[CartItem] = state.get("cart_items", [])
    constraints = state.get("constraints")
    candidates: list[CartItem] = state.get("candidate_items", [])
    inferred_intent: str = state.get("inferred_intent", "General Shopping")
    iteration: int = state.get("iteration_count", 0)
    thought_log: list[AgentThought] = list(state.get("thought_log", []))
    existing_recommendations: list[Recommendation] = list(state.get("recommendations", []))

    iteration += 1
    budget_cap: float = constraints.budget_cap if constraints else float("inf")
    restrictions: list[str] = constraints.dietary_or_brand_restrictions if constraints else []
    cart_total = _cart_total(cart_items)
    remaining_budget = budget_cap - cart_total

    thought_log.append(AgentThought(
        agent="GuardrailAgent",
        message=(
            f"[Iteration {iteration}] Validating {len(candidates)} candidate(s). "
            f"Remaining budget: ${remaining_budget:.2f}. "
            f"Restrictions: {restrictions or ['none']}."
        ),
    ))

    cart_ids: set[str] = {item.id for item in cart_items}
    existing_rec_ids: set[str] = {r.item_id for r in existing_recommendations}

    passed: list[CartItem] = []
    budget_violated: list[CartItem] = []

    for candidate in candidates:
        if candidate.id in cart_ids or candidate.id in existing_rec_ids:
            continue
        if _is_restricted(candidate, restrictions):
            thought_log.append(AgentThought(
                agent="GuardrailAgent",
                message=f"Excluded '{candidate.name}' — matches restriction filter.",
            ))
            continue
        if candidate.price <= remaining_budget:
            passed.append(candidate)
        else:
            budget_violated.append(candidate)
            thought_log.append(AgentThought(
                agent="GuardrailAgent",
                message=(
                    f"'{candidate.name}' (${candidate.price:.2f}) exceeds "
                    f"remaining budget (${remaining_budget:.2f}) — flagged."
                ),
            ))

    should_retry = bool(budget_violated) and not passed and iteration < _MAX_ITERATIONS

    if should_retry:
        tighter_ceiling = remaining_budget * _BUDGET_TIGHTEN_FACTOR
        thought_log.append(AgentThought(
            agent="GuardrailAgent",
            message=(
                f"All {len(budget_violated)} candidate(s) over budget. "
                f"Retrying with price ceiling ${tighter_ceiling:.2f} "
                f"(iteration {iteration}/{_MAX_ITERATIONS})."
            ),
        ))
        return {
            "status": "retry_budget",
            "iteration_count": iteration,
            "price_ceiling": tighter_ceiling,
            "thought_log": thought_log,
            "candidate_items": [],
        }

    if not passed:
        thought_log.append(AgentThought(
            agent="GuardrailAgent",
            message="No affordable candidates found. Finalising with no new recommendations.",
        ))
        return {
            "status": "completed",
            "iteration_count": iteration,
            "recommendations": existing_recommendations,
            "thought_log": thought_log,
        }

    llm = _build_llm()
    new_recommendations: list[Recommendation] = list(existing_recommendations)

    for item in passed[:5]:
        discount_note = ""
        if os.getenv("TAVILY_API_KEY"):
            dr = check_discount(item.name, item.price)
            if dr.discount_found:
                discount_note = f" (Discount available: {dr.note[:80]})"

        justification = _get_justification(llm, item, inferred_intent, cart_items)
        if discount_note:
            justification += discount_note

        rank_score = max(0.95 - (passed.index(item) * 0.05), 0.70)
        rec = Recommendation(
            item_id=item.id,
            name=item.name,
            price=item.price,
            justification=justification,
            confidence_score=round(rank_score, 2),
        )
        new_recommendations.append(rec)
        thought_log.append(AgentThought(
            agent="GuardrailAgent",
            message=f"✓ Recommending '{item.name}' (${item.price:.2f}) — {justification}",
        ))

    thought_log.append(AgentThought(
        agent="GuardrailAgent",
        message=f"Completed. {len(new_recommendations)} recommendation(s) finalised.",
    ))

    return {
        "status": "completed",
        "iteration_count": iteration,
        "recommendations": new_recommendations,
        "thought_log": thought_log,
        "candidate_items": [],
    }
