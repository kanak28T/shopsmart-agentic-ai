import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ShopSmart from './pages/ShopSmart';
import Recommendations from './pages/Recommendations';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<ShopSmart />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </Router>
      <Toaster />
    </CartProvider>
  );
}

export default App;
