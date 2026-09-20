"""
backend/tests/test_graph.py
Integration smoke tests for the LangGraph pipeline.
LLM calls and vector store are mocked — no API key needed.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from src.core.state import CartItem, CartState, UserConstraints
from src.core.graph import run_graph, _route_after_guardrail


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture()
def sample_cart() -> list[CartItem]:
    return [
        CartItem(
            id="mic-001", name="Audio-Technica AT2020 Condenser Microphone",
            category="Audio", price=99.0,
            tags=["microphone", "XLR", "podcasting"], specs={"type": "condenser"},
        ),
        CartItem(
            id="acc-001", name="Focusrite Scarlett Solo",
            category="Audio", price=119.0,
            tags=["audio interface", "XLR", "USB"], specs={"inputs": "1x XLR"},
        ),
    ]


@pytest.fixture()
def sample_constraints() -> UserConstraints:
    return UserConstraints(budget_cap=500.0)


@pytest.fixture()
def tight_constraints() -> UserConstraints:
    """Budget so tight no candidate fits on first pass (cart total ≈ $218)."""
    return UserConstraints(budget_cap=220.0)


@pytest.fixture()
def candidate_item() -> CartItem:
    return CartItem(
        id="acc-003", name="Pop Filter Microphone Shield",
        category="Audio", price=14.99,
        tags=["pop filter", "podcasting"], specs={"material": "nylon"},
    )


# ─── Router unit tests ────────────────────────────────────────────────────────

class TestConditionalRouter:
    def test_routes_to_retrieval_on_retry(self):
        state: CartState = {"status": "retry_budget", "iteration_count": 1}
        assert _route_after_guardrail(state) == "retrieval_node"

    def test_routes_to_end_on_completed(self):
        from langgraph.graph import END
        state: CartState = {"status": "completed", "iteration_count": 1}
        assert _route_after_guardrail(state) == END

    def test_routes_to_end_when_max_iterations_hit(self):
        from langgraph.graph import END
        state: CartState = {"status": "retry_budget", "iteration_count": 3}
        assert _route_after_guardrail(state) == END

    def test_routes_to_end_on_unknown_status(self):
        from langgraph.graph import END
        state: CartState = {"status": "evaluating", "iteration_count": 0}
        assert _route_after_guardrail(state) == END


# ─── Integration tests ────────────────────────────────────────────────────────

def _make_llm_mock(response_text: str) -> MagicMock:
    mock_llm = MagicMock()
    mock_response = MagicMock()
    mock_response.content = response_text
    mock_llm.invoke.return_value = mock_response
    return mock_llm


class TestRunGraph:
    @patch("src.agents.guardrail._build_llm")
    @patch("src.agents.intent._build_llm")
    @patch("src.agents.retrieval.search_catalog")
    def test_happy_path_produces_recommendations(
        self, mock_search, mock_intent_llm, mock_guardrail_llm,
        sample_cart, sample_constraints, candidate_item,
    ):
        mock_intent_llm.return_value = _make_llm_mock(
            '{"inferred_intent": "Podcasting Studio Setup", "missing_essentials": ["Pop Filter"]}'
        )
        mock_guardrail_llm.return_value = _make_llm_mock(
            "Removes plosive sounds before the audio interface."
        )
        mock_search.return_value = [candidate_item]

        result = run_graph(cart_items=sample_cart, constraints=sample_constraints)

        assert result["status"] == "completed"
        assert result["inferred_intent"] == "Podcasting Studio Setup"
        assert len(result["recommendations"]) >= 1
        assert result["recommendations"][0].item_id == "acc-003"
        assert len(result["thought_log"]) > 0

    @patch("src.agents.guardrail._build_llm")
    @patch("src.agents.intent._build_llm")
    @patch("src.agents.retrieval.search_catalog")
    def test_budget_retry_loop_triggers(
        self, mock_search, mock_intent_llm, mock_guardrail_llm,
        sample_cart, tight_constraints,
    ):
        """
        Verify the cyclic retry path: all first-pass candidates are over budget,
        guardrail sets status='retry_budget', retrieval runs again with tighter
        ceiling and returns an affordable item.

        Strategy: make search_catalog always return the expensive item so that
        the guardrail's should_retry condition fires (budget_violated AND not passed).
        After _BUDGET_TIGHTEN_FACTOR reduces the ceiling below $749, the next
        retrieval pass also returns the expensive item — but the guardrail will
        hit _MAX_ITERATIONS (3) and finalise. We verify iteration_count >= 2.

        We use a lambda side_effect so it never gets exhausted regardless of
        how many times search_catalog is called.
        """
        expensive = CartItem(
            id="cam-002", name="Sony ZV-E10 Camera",
            category="Camera", price=749.0, tags=["camera"], specs={},
        )
        mock_intent_llm.return_value = _make_llm_mock(
            '{"inferred_intent": "Podcasting Studio", "missing_essentials": ["Pop Filter"]}'
        )
        mock_guardrail_llm.return_value = _make_llm_mock("Stops plosives.")
        # Always return expensive item — guardrail will keep retrying until
        # iteration_count hits MAX_GRAPH_ITERATIONS (default 3).
        mock_search.side_effect = lambda *args, **kwargs: [expensive]

        result = run_graph(cart_items=sample_cart, constraints=tight_constraints)

        assert result["status"] == "completed"
        assert result["iteration_count"] >= 2

    @patch("src.agents.guardrail._build_llm")
    @patch("src.agents.intent._build_llm")
    @patch("src.agents.retrieval.search_catalog")
    def test_restriction_filter_blocks_item(
        self, mock_search, mock_intent_llm, mock_guardrail_llm,
        sample_cart, candidate_item,
    ):
        restricted = UserConstraints(
            budget_cap=500.0, dietary_or_brand_restrictions=["pop filter"],
        )
        mock_intent_llm.return_value = _make_llm_mock(
            '{"inferred_intent": "Podcasting Studio", "missing_essentials": ["Pop Filter"]}'
        )
        mock_guardrail_llm.return_value = _make_llm_mock("Stops plosives.")
        mock_search.return_value = [candidate_item]

        result = run_graph(cart_items=sample_cart, constraints=restricted)

        rec_ids = [r.item_id for r in result.get("recommendations", [])]
        assert "acc-003" not in rec_ids

    @patch("src.agents.guardrail._build_llm")
    @patch("src.agents.intent._build_llm")
    @patch("src.agents.retrieval.search_catalog")
    def test_empty_cart_returns_general_intent(
        self, mock_search, mock_intent_llm, mock_guardrail_llm, sample_constraints,
    ):
        mock_intent_llm.return_value = _make_llm_mock(
            '{"inferred_intent": "General Shopping", "missing_essentials": []}'
        )
        mock_guardrail_llm.return_value = _make_llm_mock("Useful item.")
        mock_search.return_value = []

        result = run_graph(cart_items=[], constraints=sample_constraints)

        assert result["inferred_intent"] == "General Shopping"
        assert result["status"] == "completed"

    @patch("src.agents.guardrail._build_llm")
    @patch("src.agents.intent._build_llm")
    @patch("src.agents.retrieval.search_catalog")
    def test_iteration_count_increments(
        self, mock_search, mock_intent_llm, mock_guardrail_llm,
        sample_cart, sample_constraints, candidate_item,
    ):
        mock_intent_llm.return_value = _make_llm_mock(
            '{"inferred_intent": "Podcasting Studio", "missing_essentials": ["Pop Filter"]}'
        )
        mock_guardrail_llm.return_value = _make_llm_mock("Stops plosives.")
        mock_search.return_value = [candidate_item]

        result = run_graph(cart_items=sample_cart, constraints=sample_constraints)
        assert result["iteration_count"] >= 1

    @patch("src.agents.guardrail._build_llm")
    @patch("src.agents.intent._build_llm")
    @patch("src.agents.retrieval.search_catalog")
    def test_no_duplicate_recommendations(
        self, mock_search, mock_intent_llm, mock_guardrail_llm,
        sample_cart, sample_constraints, candidate_item,
    ):
        mock_intent_llm.return_value = _make_llm_mock(
            '{"inferred_intent": "Podcasting Studio", "missing_essentials": ["Pop Filter", "Cable"]}'
        )
        mock_guardrail_llm.return_value = _make_llm_mock("Stops plosives.")
        mock_search.return_value = [candidate_item]

        result = run_graph(cart_items=sample_cart, constraints=sample_constraints)

        rec_ids = [r.item_id for r in result.get("recommendations", [])]
        assert len(rec_ids) == len(set(rec_ids)), "Duplicate recommendations found"
