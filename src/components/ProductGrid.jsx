import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, isInCart, onAdd }) {
  if (products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
        No products match your search.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} inCart={isInCart(p.id)} onAdd={onAdd} />
      ))}
    </div>
  );
}