import { useState } from "react";
import { Plus, Check, Star } from "lucide-react";

export default function RecommendationCard({ rec, inCart, onAdd }) {
  const [imgOk, setImgOk] = useState(true);
  const fallback = `https://picsum.photos/seed/${rec.id}/500/500`;
  const dots = Math.round(rec.confidence * 5);

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/60">
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img
            src={imgOk ? rec.image : fallback}
            onError={() => setImgOk(false)}
            alt={rec.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800">{rec.name}</h4>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-display text-lg font-extrabold text-slate-900">₹{rec.price.toLocaleString("en-IN")}</span>
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {rec.rating}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={
                    "h-1.5 w-1.5 rounded-full " + (n <= dots ? "bg-orange-500" : "bg-slate-200")
                  }
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-emerald-600">{rec.matchPct}% match</span>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-orange-400 bg-orange-50/60 px-3 py-2">
        <p className="text-[11px] italic leading-snug text-slate-600">{rec.justification}</p>
      </div>

      <div className="p-3 pt-2.5">
        <button
          onClick={() => onAdd(rec)}
          disabled={inCart}
          className={
            "flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all " +
            (inCart
              ? "cursor-default bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
              : "bg-slate-900 text-white hover:bg-gradient-to-r hover:from-orange-600 hover:to-amber-500 active:scale-[0.98]")
          }
        >
          {inCart ? (
            <>
              <Check className="h-3.5 w-3.5" /> In Cart
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}