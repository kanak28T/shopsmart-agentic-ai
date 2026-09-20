import { useState } from "react";
import { Trash2, Bot, ChevronDown, Filter, ShoppingBag } from "lucide-react";
import CartItem from "./CartItem.jsx";
import BudgetBar from "./BudgetBar.jsx";

export default function CartPanel({
  items,
  subtotal,
  budget,
  onRemove,
  onClear,
  onGetRecommendations,
  loading,
  restrictions,
  setRestrictions,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Gradient header */}
      <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-50 to-orange-50/50 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-white shadow-sm">
              <ShoppingBag className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">My Cart</h3>
            <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
              {items.length}
            </span>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-3xl">🛒</div>
            <p className="mt-3 text-sm font-semibold text-slate-600">Your cart is empty</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Add products from the store to get AI suggestions
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3.5">
        <BudgetBar subtotal={subtotal} budget={budget} />

        {/* Collapsible restriction filter */}
        <div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex w-full items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <span className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Brand / allergy filters
            </span>
            <ChevronDown className={"h-3.5 w-3.5 transition-transform " + (showFilters ? "rotate-180" : "")} />
          </button>
          {showFilters && (
            <input
              type="text"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="e.g. Sony, plastic (comma separated)"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition-colors focus:border-orange-400"
            />
          )}
        </div>

        <button
          onClick={onGetRecommendations}
          disabled={items.length === 0 || loading}
          className={
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 " +
            (items.length === 0 || loading
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:brightness-110 active:scale-[0.98]")
          }
        >
          <Bot className="h-4 w-4" />
          {loading ? "AI is thinking…" : "🤖 Get AI Recommendations"}
        </button>
      </div>
    </div>
  );
}