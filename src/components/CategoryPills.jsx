import { CATEGORIES } from "../data/catalog.js";

export default function CategoryPills({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 " +
              (isActive
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900")
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}