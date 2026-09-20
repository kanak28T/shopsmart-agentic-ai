import { Bot, Brain, Search, ShieldCheck } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-900 px-7 py-7 text-white shadow-2xl shadow-slate-900/20">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/40 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-amber-500/30 blur-3xl" />
      <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Bot className="h-3.5 w-3.5" /> Multi-Agent Recommendation Engine
          </span>
          <h2 className="mt-3.5 font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight">
            Your cart,{" "}
            <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
              understood.
            </span>
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75">
            Add products and our 3-agent pipeline infers your shopping intent, then
            recommends the missing pieces that fit your budget — with a full reasoning
            trail.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-white/60">
            <span>
              <b className="text-white">64</b> products
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span>
              <b className="text-white">10</b> categories
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span>
              <b className="text-white">3</b> AI agents
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col gap-2.5 lg:flex">
          <AgentChip icon={<Brain className="h-4 w-4" />} n="01" name="IntentAgent" tint="text-orange-300" />
          <AgentChip icon={<Search className="h-4 w-4" />} n="02" name="RetrievalAgent" tint="text-sky-300" />
          <AgentChip icon={<ShieldCheck className="h-4 w-4" />} n="03" name="GuardrailAgent" tint="text-emerald-300" />
        </div>
      </div>
    </div>
  );
}

function AgentChip({ icon, n, name, tint }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur transition-colors hover:bg-white/10">
      <span className={"font-mono text-xs font-bold " + tint}>{n}</span>
      <span className={tint}>{icon}</span>
      <span className="text-sm font-semibold text-white">{name}</span>
    </div>
  );
}