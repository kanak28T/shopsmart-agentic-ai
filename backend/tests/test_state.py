"""
backend/tests/test_state.py
Unit tests for Pydantic v2 schema validation. Runs without LLM or network.
"""

import pytest
from pydantic import ValidationError

from src.core.state import (
    AgentThought,
    CartItem,
    CartState,
    Recommendation,
    UserConstraints,
)


class TestCartItem:
    def test_valid_construction(self):
        item = CartItem(
            id="mic-001", name="AT2020 Microphone", category="Audio",
            price=99.0, tags=["microphone", "podcasting"], specs={"type": "condenser"},
        )
        assert item.id == "mic-001"
        assert item.price == 99.0

    def test_negative_price_rejected(self):
        with pytest.raises(ValidationError):
            CartItem(id="x", name="Bad", category="Test", price=-1.0)

    def test_zero_price_allowed(self):
        item = CartItem(id="free-001", name="Free Item", category="Software", price=0.0)
        assert item.price == 0.0

    def test_frozen_immutability(self):
        item = CartItem(id="mic-001", name="AT2020", category="Audio", price=99.0)
        with pytest.raises(Exception):
            item.price = 50.0  # type: ignore[misc]

    def test_embedding_text_format(self):
        item = CartItem(
            id="mic-001", name="AT2020", category="Audio", price=99.0,
            tags=["microphone"], specs={"type": "condenser"},
        )
        text = item.to_embedding_text()
        assert "AT2020" in text
        assert "Audio" in text
        assert "microphone" in text

    def test_defaults_empty_collections(self):
        item = CartItem(id="x", name="X", category="Y", price=10.0)
        assert item.tags == []
        assert item.specs == {}


class TestUserConstraints:
    def test_valid_constraints(self):
        uc = UserConstraints(budget_cap=500.0, dietary_or_brand_restrictions=["Behringer"])
        assert uc.budget_cap == 500.0

    def test_restrictions_normalised_to_lowercase(self):
        uc = UserConstraints(
            budget_cap=100.0, dietary_or_brand_restrictions=["Behringer", "LATEX"],
        )
        assert "behringer" in uc.dietary_or_brand_restrictions
        assert "latex" in uc.dietary_or_brand_restrictions

    def test_zero_budget_rejected(self):
        with pytest.raises(ValidationError):
            UserConstraints(budget_cap=0.0)

    def test_negative_budget_rejected(self):
        with pytest.raises(ValidationError):
            UserConstraints(budget_cap=-100.0)

    def test_empty_restrictions_default(self):
        uc = UserConstraints(budget_cap=250.0)
        assert uc.dietary_or_brand_restrictions == []

    def test_frozen_immutability(self):
        uc = UserConstraints(budget_cap=100.0)
        with pytest.raises(Exception):
            uc.budget_cap = 200.0  # type: ignore[misc]


class TestRecommendation:
    def test_valid_recommendation(self):
        rec = Recommendation(
            item_id="mic-001", name="AT2020", price=99.0,
            justification="Adds studio-grade recording.", confidence_score=0.92,
        )
        assert rec.confidence_score == 0.92

    def test_confidence_above_one_rejected(self):
        with pytest.raises(ValidationError):
            Recommendation(
                item_id="x", name="X", price=10.0,
                justification="test", confidence_score=1.5,
            )

    def test_confidence_below_zero_rejected(self):
        with pytest.raises(ValidationError):
            Recommendation(
                item_id="x", name="X", price=10.0,
                justification="test", confidence_score=-0.1,
            )

    def test_negative_price_rejected(self):
        with pytest.raises(ValidationError):
            Recommendation(
                item_id="x", name="X", price=-5.0,
                justification="test", confidence_score=0.5,
            )


class TestAgentThought:
    def test_construction(self):
        t = AgentThought(agent="IntentAgent", message="Analysing cart…")
        assert t.agent == "IntentAgent"
        assert "Analysing" in t.message

    def test_frozen(self):
        t = AgentThought(agent="IntentAgent", message="test")
        with pytest.raises(Exception):
            t.message = "mutated"  # type: ignore[misc]


class TestCartState:
    def test_cart_state_is_typed_dict(self):
        state: CartState = {
            "cart_items": [],
            "constraints": UserConstraints(budget_cap=100.0),
            "inferred_intent": "",
            "missing_essentials": [],
            "candidate_items": [],
            "recommendations": [],
            "thought_log": [],
            "iteration_count": 0,
            "price_ceiling": None,
            "status": "evaluating",
        }
        assert state["status"] == "evaluating"
        assert state["iteration_count"] == 0

    def test_partial_cart_state_allowed(self):
        partial: CartState = {"status": "completed", "iteration_count": 1}
        assert partial["status"] == "completed"
