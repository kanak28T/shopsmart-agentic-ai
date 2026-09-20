"""
backend/src/agents/intent.py
─────────────────────────────────────────────────────────────────────────────
IntentAgent — classifies session intent and identifies missing items.
Uses Gemini 2.0 Flash (default) or GPT-4o-mini; fully traced by LangSmith.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models import BaseChatModel

from src.core.state import AgentThought, CartItem, CartState

load_dotenv()
logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are an expert e-commerce shopping assistant.

Analyse the shopping cart items and:
1. Infer a concise INTENT label (e.g. "Podcasting Studio Setup", "Backpacking Trek",
   "Home Gym Build", "Content Creator Kit", "Travel Essentials Kit").
2. Identify up to 5 MISSING ESSENTIALS — product types the user likely needs but
   hasn't added yet.

Respond ONLY with valid JSON matching this schema exactly:
{
  "inferred_intent": "<string>",
  "missing_essentials": ["<item type 1>", "<item type 2>", ...]
}

Rules:
- missing_essentials must be generic TYPE names (e.g. "Pop Filter"), never brand names.
- If the cart is empty, use "General Shopping" and an empty list.
- Do NOT include items already in the cart.
- Return ONLY the JSON — no markdown fences, no explanation."""


def _build_llm() -> BaseChatModel:
    google_key = os.getenv("GOOGLE_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    if google_key:
        from langchain_google_genai import ChatGoogleGenerativeAI
        logger.info("IntentAgent: using Gemini 2.0 Flash")
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.2,
            google_api_key=google_key,
        )
    elif openai_key:
        from langchain_openai import ChatOpenAI
        logger.info("IntentAgent: using GPT-4o-mini")
        return ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=openai_key)
    else:
        raise EnvironmentError(
            "No LLM API key found. Set GOOGLE_API_KEY or OPENAI_API_KEY in backend/.env"
        )


def _format_cart(cart_items: list[CartItem]) -> str:
    if not cart_items:
        return "The cart is currently empty."
    return "\n".join(
        f"- {item.name} (Category: {item.category}, Tags: {', '.join(item.tags[:4])})"
        for item in cart_items
    )


def _parse_response(raw: str) -> tuple[str, list[str]]:
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        parsed: dict[str, Any] = json.loads(text)
        intent = str(parsed.get("inferred_intent", "General Shopping"))
        essentials = [str(e) for e in parsed.get("missing_essentials", [])]
        return intent, essentials
    except json.JSONDecodeError as exc:
        logger.warning("IntentAgent: failed to parse JSON (%s). Raw: %s", exc, raw[:200])
        return "General Shopping", []


def intent_node(state: CartState) -> dict:
    cart_items: list[CartItem] = state.get("cart_items", [])
    thought_log: list[AgentThought] = list(state.get("thought_log", []))

    thought_log.append(AgentThought(
        agent="IntentAgent",
        message=f"Analysing cart with {len(cart_items)} item(s)…",
    ))

    llm = _build_llm()
    messages = [
        SystemMessage(content=_SYSTEM_PROMPT),
        HumanMessage(content=f"Cart items:\n\n{_format_cart(cart_items)}"),
    ]

    try:
        response = llm.invoke(messages)
        raw: str = response.content if hasattr(response, "content") else str(response)
        inferred_intent, missing_essentials = _parse_response(raw)
    except Exception as exc:
        logger.error("IntentAgent LLM call failed: %s", exc)
        inferred_intent = "General Shopping"
        missing_essentials = []
        thought_log.append(AgentThought(
            agent="IntentAgent",
            message=f"LLM call failed ({exc}). Defaulting to 'General Shopping'.",
        ))

    thought_log.append(AgentThought(
        agent="IntentAgent",
        message=(
            f"Intent inferred: '{inferred_intent}'. "
            f"Missing essentials: {missing_essentials or ['none identified']}."
        ),
    ))

    logger.info("IntentAgent → intent='%s', missing=%s", inferred_intent, missing_essentials)

    return {
        "inferred_intent": inferred_intent,
        "missing_essentials": missing_essentials,
        "thought_log": thought_log,
        "status": "evaluating",
        "iteration_count": 0,
        "candidate_items": [],
        "recommendations": [],
        "price_ceiling": None,
    }
