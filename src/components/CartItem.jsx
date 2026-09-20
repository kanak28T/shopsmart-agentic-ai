import { X } from "lucide-react";

const EMOJI = {
  Audio: "🎙️",
  Camera: "📷",
  Lighting: "💡",
  Computing: "🖥️",
  Outdoor: "🏕️",
  Fitness: "🏋️",
  Gaming: "🎮",
  Photography: "📸",
  Office: "🗂️",
  Travel: "✈️",
};

export default function CartItem({ item, onRemove }) {
  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 transition-colors hover:border-slate-200">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
        {EMOJI[item.category] || "📦"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-800">{item.name}</p>
        <p className="text-xs font-bold text-violet-600">₹{item.price.toLocaleString("en-IN")}</p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}