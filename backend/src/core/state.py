"""
backend/src/core/state.py
─────────────────────────────────────────────────────────────────────────────
Pydantic v2 schemas and the LangGraph CartState TypedDict.
"""

from __future__ import annotations

from typing import Any, Optional
from typing_extensions import TypedDict

from pydantic import BaseModel, Field, model_validator


class CartItem(BaseModel):
    """A single product in the catalog or the user's cart."""

    model_config = {"frozen": True}

    id: str = Field(..., description="Unique product identifier")
    name: str = Field(..., description="Human-readable product name")
    category: str = Field(..., description="Top-level product category")
    price: float = Field(..., ge=0.0, description="Unit price")
    tags: list[str] = Field(default_factory=list)
    specs: dict[str, Any] = Field(default_factory=dict)

    def to_embedding_text(self) -> str:
        return (
            f"{self.name} | Category: {self.category} | "
            f"Tags: {', '.join(self.tags)} | "
            f"Specs: {self.specs}"
        )


class UserConstraints(BaseModel):
    """Budget and brand/allergy constraints from the UI."""

    model_config = {"frozen": True}

    budget_cap: float = Field(..., gt=0.0)
    dietary_or_brand_restrictions: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def restrictions_lowercase(self) -> "UserConstraints":
        object.__setattr__(
            self,
            "dietary_or_brand_restrictions",
            [r.lower() for r in self.dietary_or_brand_restrictions],
        )
        return self


class Recommendation(BaseModel):
    """A single agent-generated product recommendation."""

    model_config = {"frozen": True}

    item_id: str
    name: str
    price: float = Field(..., ge=0.0)
    justification: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)


class AgentThought(BaseModel):
    """One entry in the visible reasoning / trace log shown in the UI."""

    model_config = {"frozen": True}

    agent: str
    message: str


class CartState(TypedDict, total=False):
    """Mutable state threaded through every LangGraph node."""

    cart_items: list[CartItem]
    constraints: UserConstraints
    inferred_intent: str
    missing_essentials: list[str]
    candidate_items: list[CartItem]
    recommendations: list[Recommendation]
    thought_log: list[AgentThought]
    iteration_count: int
    price_ceiling: Optional[float]
    status: str  # "evaluating" | "retry_budget" | "completed"
