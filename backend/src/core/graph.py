"""
backend/src/core/graph.py
─────────────────────────────────────────────────────────────────────────────
LangGraph StateGraph definition.

Topology
  intent_node → retrieval_node → guardrail_node
                     ▲                 │
                     │  retry_budget   │
                     └─────────────────┘
                                       │  completed
                                       ▼
                                      END
"""

from __future__ import annotations

import logging
import os
from typing import Any

from dotenv import load_dotenv
from langgraph.graph import END, StateGraph

from src.agents.guardrail import guardrail_node
from src.agents.intent import intent_node
from src.agents.retrieval import retrieval_node
from src.core.state import CartItem, CartState, UserConstraints

load_dotenv()
logger = logging.getLogger(__name__)


def _route_after_guardrail(state: CartState) -> str:
    status = state.get("status", "evaluating")
    iteration = state.get("iteration_count", 0)
    max_iter = int(os.getenv("MAX_GRAPH_ITERATIONS", "3"))

    if status == "retry_budget" and iteration < max_iter:
        logger.info("Router: retry_budget (iteration %d/%d) → retrieval_node", iteration, max_iter)
        return "retrieval_node"

    logger.info("Router: status='%s' → END", status)
    return END


def _build_graph():
    graph = StateGraph(CartState)

    graph.add_node("intent_node", intent_node)
    graph.add_node("retrieval_node", retrieval_node)
    graph.add_node("guardrail_node", guardrail_node)

    graph.set_entry_point("intent_node")
    graph.add_edge("intent_node", "retrieval_node")
    graph.add_edge("retrieval_node", "guardrail_node")

    graph.add_conditional_edges(
        "guardrail_node",
        _route_after_guardrail,
        {
            "retrieval_node": "retrieval_node",
            END: END,
        },
    )

    return graph.compile()


_compiled_graph = _build_graph()


def run_graph(
    cart_items: list[CartItem],
    constraints: UserConstraints,
) -> CartState:
    """Execute the full agent pipeline for a given cart snapshot."""
    initial_state: CartState = {
        "cart_items": cart_items,
        "constraints": constraints,
        "inferred_intent": "",
        "missing_essentials": [],
        "candidate_items": [],
        "recommendations": [],
        "thought_log": [],
        "iteration_count": 0,
        "price_ceiling": None,
        "status": "evaluating",
    }

    config: dict[str, Any] = {"recursion_limit": 10}

    if os.getenv("LANGCHAIN_TRACING_V2", "").lower() == "true":
        config["run_name"] = "SmartCartAgent"

    logger.info(
        "run_graph: cart=%d items, budget=%.2f",
        len(cart_items),
        constraints.budget_cap,
    )

    return _compiled_graph.invoke(initial_state, config=config)
