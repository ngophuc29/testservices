import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import InventoryPage from "./InventoryPage";
import ProductPage from "./ProductPage"
import ProductCardList from "./ProductCardList";
import CardPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";

function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 flex gap-4">
          <Link to="/inventory" className="text-blue-500">Inventory</Link>
          <Link to="/product" className="text-blue-500">Product</Link>
        </nav>
        <Routes>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/productlist" element={<ProductCardList />} />
          <Route path="/cart" element={<CardPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />



        </Routes>
      </div>
    </Router>
  );
}

export default App;
