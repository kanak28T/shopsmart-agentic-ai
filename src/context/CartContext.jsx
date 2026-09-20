import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getRecommendations } from "../services/agentService.js";

const CartContext = createContext(null);

export function useCart() {
  return useContext(CartContext);
}

// Shared cart + AI-recommendation state so the store page and the dedicated
// recommendations page stay perfectly in sync.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState(25000);
  const [restrictions, setRestrictions] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addToCart = useCallback((product) => {
    setItems((prev) => (prev.find((i) => i.id === product.id) ? prev : [...prev, product]));
  }, []);
  const removeFromCart = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const isInCart = useCallback((id) => items.some((i) => i.id === id), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items]);

  const fetchRecommendations = useCallback(async () => {
    if (items.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await getRecommendations(items, budget, restrictions);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }, [items, budget, restrictions]);

  const clearResult = useCallback(() => setResult(null), []);

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    subtotal,
    count: items.length,
    budget,
    setBudget,
    restrictions,
    setRestrictions,
    result,
    loading,
    fetchRecommendations,
    clearResult,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}