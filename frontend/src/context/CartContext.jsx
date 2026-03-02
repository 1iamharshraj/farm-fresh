import { createContext, useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../hooks/useAuth";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role !== "customer") return;
    try {
      const { data } = await API.get("/cart");
      setCart(data.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (produceId, quantity = 1) => {
    setCartLoading(true);
    try {
      const { data } = await API.post("/cart", { produceId, quantity });
      setCart(data.data);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await API.put(`/cart/${itemId}`, { quantity });
      setCart(data.data);
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await API.delete(`/cart/${itemId}`);
      setCart(data.data);
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await API.delete("/cart");
      setCart(data.data);
    } catch (error) {
      throw error;
    }
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, cartCount, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
