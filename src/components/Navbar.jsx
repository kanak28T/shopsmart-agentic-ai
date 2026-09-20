import { Sparkles, ShoppingCart, Zap } from "lucide-react";

export default function Navbar({ cartCount }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <h1 className="font-display text-lg font-extrabold tracking-tight text-slate-900">
              ShopSmart{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                AI
              </span>
            </h1>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              Agentic shopping co-pilot
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/60 px-1.5 py-1 text-sm font-medium text-slate-500 shadow-sm md:flex">
          <span className="cursor-default rounded-full bg-slate-900 px-4 py-1.5 text-white">
            Store
          </span>
          <span className="cursor-default px-4 py-1.5 hover:text-slate-900">Deals</span>
          <span className="cursor-default px-4 py-1.5 hover:text-slate-900">How it works</span>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 sm:flex">
            <Zap className="h-3.5 w-3.5" /> 3 agents live
          </span>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-800 shadow-sm">
            <ShoppingCart className="h-4 w-4 text-orange-600" />
            <span>{cartCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}