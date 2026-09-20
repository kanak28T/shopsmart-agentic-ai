import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import HeroBanner from "../components/HeroBanner.jsx";
import CategoryPills from "../components/CategoryPills.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import CartPanel from "../components/CartPanel.jsx";
import { useCart } from "../context/CartContext.jsx";
import { PRODUCTS } from "../data/catalog.js";

export default function ShopSmart() {
  const cart = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [search, category]);

  const handleGetRecommendations = () => {
    if (cart.items.length === 0) return;
    cart.fetchRecommendations();
    navigate("/recommendations");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <Navbar cartCount={cart.count} />

      <div className="mx-auto max-w-[1600px] px-5 py-5">
        <HeroBanner />

        {/* 2-column layout: store + cart */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_24rem]">
          {/* LEFT — Product store */}
          <section className="min-w-0">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products, categories…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <SlidersHorizontal className="h-4 w-4 text-orange-600" />
                  <input
                    type="range"
                    min={1000}
                    max={150000}
                    step={500}
                    value={cart.budget}
                    onChange={(e) => cart.setBudget(Number(e.target.value))}
                    className="w-32 accent-orange-600"
                  />
                  <span className="min-w-[4.5rem] text-sm font-bold text-slate-800">
                    ₹{Number(cart.budget).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-3.5">
                <CategoryPills active={category} onChange={setCategory} />
              </div>

              <div className="mt-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                <ProductGrid
                  products={filteredProducts}
                  isInCart={cart.isInCart}
                  onAdd={cart.addToCart}
                />
              </div>
            </div>
          </section>

          {/* RIGHT — Cart */}
          <section className="lg:sticky lg:top-[5.5rem] lg:h-[calc(100vh-7rem)]">
            <CartPanel
              items={cart.items}
              subtotal={cart.subtotal}
              budget={cart.budget}
              onRemove={cart.removeFromCart}
              onClear={cart.clearCart}
              onGetRecommendations={handleGetRecommendations}
              loading={cart.loading}
              restrictions={cart.restrictions}
              setRestrictions={cart.setRestrictions}
            />
          </section>
        </div>
      </div>
    </div>
  );
}