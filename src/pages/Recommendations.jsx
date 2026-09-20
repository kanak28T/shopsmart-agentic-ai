import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import IntentBadge from "../components/IntentBadge.jsx";
import RecommendationCard from "../components/RecommendationCard.jsx";
import AgentTraceLog from "../components/AgentTraceLog.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Recommendations() {
  const cart = useCart();
  const navigate = useNavigate();
  const { result, loading } = cart;

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <Navbar cartCount={cart.count} />

      <div className="mx-auto max-w-6xl px-5 py-6">
        <button
          onClick={() => navigate("/")}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-orange-200 hover:text-orange-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
        </button>

        <div className="mb-5 flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-slate-900">
              AI Recommendations
            </h1>
            <p className="text-xs text-slate-500">Powered by the 3-agent pipeline</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <LoadingSpinner label="Agents are thinking…" />
          </div>
        ) : !result ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-3xl">🤖</div>
            <p className="mt-3 text-sm font-semibold text-slate-700">No recommendations yet</p>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Head back to the store, add a few products to your cart, and hit "Get AI
              Recommendations".
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Go to Store
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <IntentBadge
              emoji={result.intent_emoji}
              label={result.inferred_intent}
              accent={result.intent_accent}
            />

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Recommended missing pieces
                </h2>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                  {result.recommendations.length} picks
                </span>
              </div>
              {result.recommendations.length === 0 ? (
                <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                  No recommendations fit your remaining budget of ₹
                  {Number(result.budget_remaining.toFixed(0)).toLocaleString("en-IN")}. Try increasing your budget or
                  removing a restriction.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      rec={rec}
                      inCart={cart.isInCart(rec.id)}
                      onAdd={cart.addToCart}
                    />
                  ))}
                </div>
              )}
            </section>

            <AgentTraceLog log={result.thought_log} />

            <p className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">LangSmith</span> observability —
              every agent step above is traceable & timestamped in production.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate("/")}
                className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
              >
                ← Back to Store
              </button>
              <button
                onClick={() => {
                  cart.clearResult();
                  navigate("/");
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-orange-200 hover:text-orange-600"
              >
                Clear result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}