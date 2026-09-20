export default function LoadingSpinner({ label = "Thinking…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 border-r-fuchsia-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-sky-400 animate-spin [animation-direction:reverse]" />
      </div>
      <div className="text-center">
        <p className="font-display text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-1 text-xs text-slate-400">Agents are reasoning over your cart…</p>
      </div>
    </div>
  );
}