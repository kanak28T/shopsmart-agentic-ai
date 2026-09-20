import { Star, Plus, Check } from "lucide-react";
import { useState } from "react";

// Category badge colors — kept distinct from the orange/amber brand.
const CATEGORY_COLORS = {
  Audio: "bg-purple-100 text-purple-700",
  Camera: "bg-sky-100 text-sky-700",
  Lighting: "bg-amber-100 text-amber-700",
  Computing: "bg-cyan-100 text-cyan-700",
  Outdoor: "bg-emerald-100 text-emerald-700",
  Fitness: "bg-rose-100 text-rose-700",
  Gaming: "bg-indigo-100 text-indigo-700",
  Photography: "bg-pink-100 text-pink-700",
  Office: "bg-slate-100 text-slate-700",
  Travel: "bg-teal-100 text-teal-700",
};

export default function ProductCard({ product, inCart, onAdd }) {
  const [imgOk, setImgOk] = useState(true);
  const fallback = `https://picsum.photos/seed/${product.id}/500/500`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={imgOk ? product.image : fallback}
          onError={() => setImgOk(false)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span
          className={
            "absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur " +
            (CATEGORY_COLORS[product.category] || "bg-slate-100 text-slate-700")
          }
        >
          {product.category}
        </span>
        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {product.rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-800">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {product.reviews.toLocaleString()} reviews
        </p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={inCart}
            className={
              "flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 " +
              (inCart
                ? "cursor-default bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : "bg-slate-900 text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 active:scale-95")
            }
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}