import { useState } from "react";
import { ChevronDown } from "lucide-react";

const COLOR_MAP = {
  violet: { dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 border-violet-200" },
  sky: { dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700 border-sky-200" },
  emerald: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function AgentTraceLog({ log }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="text-base">🧠</span> Agent Decision Trail
        </span>
        <ChevronDown
          className={"h-4 w-4 text-slate-400 transition-transform " + (open ? "rotate-180" : "")}
        />
      </button>

      {open && (
        <div className="space-y-2.5 border-t border-slate-100 px-4 py-3">
          {log.map((entry, i) => {
            const c = COLOR_MAP[entry.color] || COLOR_MAP.violet;
            return (
              <div key={i} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <span className={"mt-1 h-2.5 w-2.5 rounded-full " + c.dot} />
                  {i < log.length - 1 && <span className="my-0.5 w-px flex-1 bg-slate-200" />}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{entry.emoji}</span>
                    <span className={"rounded-md border px-1.5 py-0.5 text-[10px] font-bold " + c.chip}>
                      {entry.agent}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{entry.step}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{entry.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}