/**
 * agentService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Calls the real Python LangGraph backend at /api/recommend.
 * Falls back to the deterministic JS mock pipeline when the backend is
 * unreachable (e.g. during a pure-frontend demo or CI).
 *
 * Backend contract (POST /api/recommend):
 *   Request  → { cart_items, budget, restrictions }
 *   Response → { inferred_intent, intent_emoji, intent_accent,
 *                recommendations, thought_log, budget_remaining }
 *
 * The response shape is identical to what Recommendations.jsx and
 * AgentTraceLog.jsx already consume, so no other component changes needed.
 */

import { PRODUCTS } from "../data/catalog.js";

// ─────────────────────────────────────────────────────────────────────────────
// Real backend call
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/**
 * POST cart to the Python FastAPI backend.
 * Returns the parsed JSON response, or throws on HTTP / network error.
 */
async function callBackend(cartItems, budget, restrictions) {
  const response = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cart_items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        tags: item.tags ?? [],
        specs: item.specs ?? {},
        subcategory: item.subcategory ?? "",
        image: item.image ?? "",
        rating: item.rating ?? 4.5,
        reviews: item.reviews ?? 0,
      })),
      budget,
      restrictions: restrictions ?? "",
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Backend error ${response.status}: ${text}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// JS mock pipeline (fallback — runs entirely in-browser)
// Kept identical to the original base44 logic so demos work offline.
// ─────────────────────────────────────────────────────────────────────────────

const INTENTS = [
  {
    label: "Podcasting Studio Setup", emoji: "🎙️",
    triggerTags: ["microphone", "audio interface", "pop filter", "boom arm", "xlr_cable", "headphones", "podcasting", "XLR", "audio_interface"],
    essentials: ["audio interface", "pop filter", "boom arm", "xlr_cable", "headphones"],
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    label: "Backpacking Trek", emoji: "🏔️",
    triggerTags: ["backpack", "sleeping bag", "water filter", "camping stove", "headlamp", "tent", "trekking poles", "hiking", "backpacking", "camping"],
    essentials: ["sleeping bag", "water filter", "camping stove", "headlamp", "tent", "trekking poles"],
    accent: "from-emerald-500 to-teal-500",
  },
  {
    label: "Home Gym Setup", emoji: "💪",
    triggerTags: ["dumbbells", "yoga mat", "resistance bands", "massage gun", "protein powder", "fitness", "home gym", "exercise"],
    essentials: ["yoga mat", "resistance bands", "protein powder", "massage gun"],
    accent: "from-orange-500 to-rose-500",
  },
  {
    label: "Gaming Rig Build", emoji: "🎮",
    triggerTags: ["gaming headset", "gaming monitor", "capture card", "keyboard", "mouse", "gaming", "esports", "stream deck"],
    essentials: ["gaming headset", "gaming monitor", "keyboard", "mouse"],
    accent: "from-indigo-500 to-blue-500",
  },
  {
    label: "Content Creator Kit", emoji: "🎥",
    triggerTags: ["webcam", "camera", "tripod", "ring light", "key light", "led panel", "gimbal", "sd card", "content creation", "streaming", "vlogging"],
    essentials: ["tripod", "key light", "sd card", "gimbal"],
    accent: "from-pink-500 to-purple-500",
  },
  {
    label: "DIY Electronics Build", emoji: "🤖",
    triggerTags: ["raspberry pi", "arduino", "IoT", "maker", "single board computer", "microcontroller"],
    essentials: ["storage", "memory"],
    accent: "from-cyan-500 to-sky-500",
  },
  {
    label: "Travel Essentials Kit", emoji: "✈️",
    triggerTags: ["charger", "travel backpack", "MagSafe", "GaN", "USB-C", "travel", "carry-on", "portable"],
    essentials: ["charger", "travel backpack"],
    accent: "from-amber-500 to-orange-500",
  },
];

const GENERAL = {
  label: "General Shopping", emoji: "🛒",
  triggerTags: [], essentials: [],
  accent: "from-slate-500 to-slate-700",
};

function runMockIntentAgent(cartItems) {
  const thoughtLog = [];
  thoughtLog.push({
    agent: "IntentAgent", emoji: "🧠", color: "violet",
    step: "Parsing cart",
    detail: `Analysing ${cartItems.length} item(s): ${cartItems.map((i) => i.name).join(", ") || "(empty)"}`,
  });

  if (cartItems.length === 0) {
    thoughtLog.push({ agent: "IntentAgent", emoji: "🧠", color: "violet", step: "No signal", detail: "Empty cart — defaulting to General Shopping." });
    return { intent: GENERAL, thoughtLog };
  }

  const scores = INTENTS.map((intent) => {
    let hits = 0;
    const matched = [];
    cartItems.forEach((item) => {
      const itemText = [item.name, ...(item.tags ?? [])].join(" ").toLowerCase();
      if (intent.triggerTags.some((t) => itemText.includes(t.toLowerCase()))) {
        hits++;
        matched.push(item.name);
      }
    });
    return { intent, hits, matched };
  }).sort((a, b) => b.hits - a.hits);

  const top = scores[0];
  thoughtLog.push({
    agent: "IntentAgent", emoji: "🧠", color: "violet",
    step: "Scoring intents",
    detail: scores.filter((s) => s.hits > 0).map((s) => `${s.intent.label}: ${s.hits}`).join(" · ") || "No strong match.",
  });

  const chosen = top.hits >= 2 ? top.intent : GENERAL;
  thoughtLog.push({
    agent: "IntentAgent", emoji: "🧠", color: "violet",
    step: "Intent inferred",
    detail: `${chosen.label}${top.hits >= 2 ? ` (${top.hits} matching items)` : " — weak signal, defaulting to General Shopping"}.`,
  });

  return { intent: chosen, thoughtLog };
}

function runMockRetrievalAgent(intent, cartItems, remainingBudget, thoughtLog) {
  const cartIds = new Set(cartItems.map((i) => i.id));
  const cartTagSet = new Set(cartItems.flatMap((i) => (i.tags ?? []).map((t) => t.toLowerCase())));

  const missing = intent.essentials.filter((e) => !cartTagSet.has(e.toLowerCase()));

  thoughtLog.push({
    agent: "RetrievalAgent", emoji: "🔍", color: "sky",
    step: "Identifying gaps",
    detail: missing.length > 0
      ? `Missing for ${intent.label}: ${missing.join(", ")}.`
      : `All essentials present — surfacing top-rated upgrades.`,
  });

  const targetTags = missing.length > 0 ? missing : intent.triggerTags;

  let candidates = PRODUCTS.filter((p) => {
    if (cartIds.has(p.id)) return false;
    if (targetTags.length === 0) return true;
    const itemText = [p.name, ...(p.tags ?? [])].join(" ").toLowerCase();
    return targetTags.some((t) => itemText.includes(t.toLowerCase()));
  }).map((p) => {
    const budgetFit = p.price <= remainingBudget ? 1 : 0.3;
    const relevance = (p.rating ?? 4) * (1 + Math.log10((p.reviews ?? 1) + 1) / 10) * budgetFit;
    return { ...p, _relevance: relevance };
  }).sort((a, b) => b._relevance - a._relevance);

  thoughtLog.push({
    agent: "RetrievalAgent", emoji: "🔍", color: "sky",
    step: "Candidate retrieval",
    detail: `Pulled ${candidates.length} candidate(s), ranked by rating × reviews × budget fit.`,
  });

  return { candidates, missing, thoughtLog };
}

function runMockGuardrailAgent(candidates, cartItems, remainingBudget, restrictions, thoughtLog) {
  const cartIds = new Set(cartItems.map((i) => i.id));
  const restrictionList = restrictions.split(/[,\n]/).map((r) => r.trim().toLowerCase()).filter(Boolean);

  let filtered = candidates.filter((p) => {
    if (cartIds.has(p.id)) return false;
    if (restrictionList.some((r) => p.name.toLowerCase().includes(r))) return false;
    return true;
  });

  let affordable = filtered.filter((p) => p.price <= remainingBudget);
  const tooExpensive = filtered.filter((p) => p.price > remainingBudget);

  thoughtLog.push({
    agent: "GuardrailAgent", emoji: "🛡️", color: "emerald",
    step: "Applying guardrails",
    detail: `Budget left: $${remainingBudget.toFixed(0)}. ${affordable.length} affordable, ${tooExpensive.length} over budget${restrictionList.length ? `, restrictions: ${restrictionList.join(", ")}` : ""}.`,
  });

  // Substitute cheaper alternatives for over-budget items
  const subs = [];
  tooExpensive.forEach((p) => {
    const alt = PRODUCTS.filter(
      (x) => x.category === p.category && !cartIds.has(x.id) && x.id !== p.id && x.price <= remainingBudget
    ).sort((a, b) => a.price - b.price)[0];
    if (alt && !affordable.find((a) => a.id === alt.id)) subs.push(alt);
  });

  if (subs.length) {
    thoughtLog.push({
      agent: "GuardrailAgent", emoji: "🛡️", color: "emerald",
      step: "Cheaper alternatives",
      detail: `Substituted ${subs.length} over-budget item(s) with in-category alternatives.`,
    });
    affordable = [...affordable, ...subs];
  }

  const seen = new Set();
  const final = affordable
    .filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; })
    .sort((a, b) => (b._relevance ?? 0) - (a._relevance ?? 0))
    .slice(0, 4);

  thoughtLog.push({
    agent: "GuardrailAgent", emoji: "🛡️", color: "emerald",
    step: "Final selection",
    detail: `Returning ${final.length} recommendation(s) that pass all guardrails.`,
  });

  return { recommendations: final, thoughtLog };
}

function buildMockJustification(product, intent, remainingBudget) {
  const isEssential = intent.essentials.some((e) => product.name.toLowerCase().includes(e.toLowerCase()));
  const fits = product.price <= remainingBudget;
  const reason = isEssential
    ? `A missing essential for your ${intent.label.toLowerCase()} — completes your kit.`
    : `Enhances your ${intent.label.toLowerCase()} setup.`;
  const budgetNote = fits
    ? `Fits your remaining budget of ₹${Number(remainingBudget.toFixed(0)).toLocaleString("en-IN")}.`
    : `Slightly over budget but highest-rated in its class.`;
  return `${reason} Rated ${product.rating ?? 4.5}★ from ${(product.reviews ?? 0).toLocaleString()} reviews. ${budgetNote}`;
}

async function runMockPipeline(cartItems, budget, restrictions) {
  const cartTotal = cartItems.reduce((s, i) => s + i.price, 0);
  const remainingBudget = Math.max(0, budget - cartTotal);

  // Simulated latency so the "AI is thinking" state is visible
  await new Promise((res) => setTimeout(res, 1200 + Math.random() * 600));

  const { intent, thoughtLog } = runMockIntentAgent(cartItems);
  const { candidates } = runMockRetrievalAgent(intent, cartItems, remainingBudget, thoughtLog);
  const { recommendations } = runMockGuardrailAgent(candidates, cartItems, remainingBudget, restrictions, thoughtLog);

  const recs = recommendations.map((p, idx) => {
    const confidence = Math.min(0.99, Math.max(0.7, 0.7 + (p._relevance ?? 0) / 12 + (3 - idx) * 0.04));
    return {
      ...p,
      confidence,
      matchPct: Math.round(confidence * 100),
      justification: buildMockJustification(p, intent, remainingBudget),
    };
  });

  return {
    inferred_intent: intent.label,
    intent_emoji: intent.emoji,
    intent_accent: intent.accent,
    recommendations: recs,
    thought_log: thoughtLog,
    budget_remaining: remainingBudget,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — exported and consumed by CartContext.jsx
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get AI recommendations for the current cart.
 *
 * 1. Tries the real Python backend first.
 * 2. If unreachable (network error, 502, etc.) falls back to the JS mock.
 *    A console.warn is emitted so developers know the fallback kicked in.
 */
export async function getRecommendations(cartItems, budget, restrictions = "") {
  try {
    const result = await callBackend(cartItems, budget, restrictions);
    console.info("[AgentService] ✓ Real backend response received.");
    return result;
  } catch (err) {
    console.warn(
      "[AgentService] Backend unreachable — running JS mock pipeline.\n",
      err.message,
    );
    return runMockPipeline(cartItems, budget, restrictions);
  }
}
