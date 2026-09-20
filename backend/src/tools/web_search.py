"""
backend/src/tools/web_search.py
─────────────────────────────────────────────────────────────────────────────
Tavily coupon/promotional-price lookup. Stubs out cleanly when no API key.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class DiscountResult:
    def __init__(
        self,
        product_name: str,
        discount_found: bool,
        coupon_code: Optional[str],
        discounted_price: Optional[float],
        source_url: Optional[str],
        note: str,
    ) -> None:
        self.product_name = product_name
        self.discount_found = discount_found
        self.coupon_code = coupon_code
        self.discounted_price = discounted_price
        self.source_url = source_url
        self.note = note


def check_discount(product_name: str, base_price: float) -> DiscountResult:
    api_key = os.getenv("TAVILY_API_KEY", "")

    if not api_key:
        return DiscountResult(
            product_name=product_name,
            discount_found=False,
            coupon_code=None,
            discounted_price=None,
            source_url=None,
            note="Tavily API key not configured.",
        )

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=f"{product_name} discount coupon promo code",
            search_depth="basic",
            max_results=3,
        )
        for result in response.get("results", []):
            content = result.get("content", "").lower()
            if any(kw in content for kw in ["coupon", "promo", "discount", "off", "save"]):
                return DiscountResult(
                    product_name=product_name,
                    discount_found=True,
                    coupon_code=None,
                    discounted_price=None,
                    source_url=result.get("url"),
                    note=result.get("content", "")[:200],
                )
        return DiscountResult(
            product_name=product_name, discount_found=False,
            coupon_code=None, discounted_price=None, source_url=None,
            note="No active discounts found.",
        )
    except Exception as exc:
        logger.warning("Tavily search failed for '%s': %s", product_name, exc)
        return DiscountResult(
            product_name=product_name, discount_found=False,
            coupon_code=None, discounted_price=None, source_url=None,
            note=f"Tavily error: {exc}",
        )
