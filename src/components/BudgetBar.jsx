// Animated budget progress bar: green -> orange -> red as spend approaches budget.
export default function BudgetBar({ subtotal, budget }) {
  const pct = budget > 0 ? Math.min(100, (subtotal / budget) * 100) : 0;
  const remaining = Math.max(0, budget - subtotal);

  let barColor = "from-emerald-400 to-emerald-500";
  if (pct > 85) barColor = "from-rose-400 to-rose-500";
  else if (pct > 65) barColor = "from-amber-400 to-orange-500";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Budget used</span>
        <span className="font-bold text-slate-800">
          ₹{Number(subtotal.toFixed(0)).toLocaleString("en-IN")} <span className="text-slate-400">/ ₹{Number(budget).toLocaleString("en-IN")}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={"h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out " + barColor}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-500">
        Remaining:{" "}
        <span className={"font-bold " + (remaining === 0 ? "text-rose-500" : "text-slate-800")}>
          ₹{Number(remaining.toFixed(0)).toLocaleString("en-IN")}
        </span>
      </p>
    </div>
  );
}