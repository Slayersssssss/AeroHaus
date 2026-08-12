"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { getProductBySlug, getVehicleRecordByKey } from "@/lib/store";
import type { CartLine } from "@/lib/types";

interface StorefrontContextValue {
  cartItems: CartLine[];
  wishlist: string[];
  savedVehicleKeys: string[];
  selectedVehicle: ReturnType<typeof getVehicleRecordByKey>;
  cartOpen: boolean;
  subtotal: number;
  addToCart: (input: Omit<CartLine, "id"> & { openDrawer?: boolean }) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  setSelectedVehicle: (vehicleKey?: string) => void;
  toggleWishlist: (productSlug: string) => void;
  isWishlisted: (productSlug: string) => boolean;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartLine[]>(() =>
    readStorage<CartLine[]>("aerohaus-cart", [])
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage<string[]>("aerohaus-wishlist", [])
  );
  const [savedVehicleKeys, setSavedVehicleKeys] = useState<string[]>(() =>
    readStorage<string[]>("aerohaus-garage", [])
  );
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string | undefined>(() =>
    readStorage<string | undefined>("aerohaus-selected-vehicle", undefined)
  );
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { window.localStorage.setItem("aerohaus-cart", JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { window.localStorage.setItem("aerohaus-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { window.localStorage.setItem("aerohaus-garage", JSON.stringify(savedVehicleKeys)); }, [savedVehicleKeys]);
  useEffect(() => {
    if (!selectedVehicleKey) { window.localStorage.removeItem("aerohaus-selected-vehicle"); return; }
    window.localStorage.setItem("aerohaus-selected-vehicle", JSON.stringify(selectedVehicleKey));
  }, [selectedVehicleKey]);

  const selectedVehicle = useMemo(() => getVehicleRecordByKey(selectedVehicleKey), [selectedVehicleKey]);
  const subtotal = useMemo(() => cartItems.reduce((total, line) => {
    const product = getProductBySlug(line.productSlug);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return total + (variant?.price ?? 0) * line.quantity;
  }, 0), [cartItems]);

  const value: StorefrontContextValue = {
    cartItems,
    wishlist,
    savedVehicleKeys,
    selectedVehicle,
    cartOpen,
    subtotal,
    addToCart(input) {
      const lineId = `${input.productSlug}-${input.variantId}-${input.vehicleKey ?? "guest"}`;
      setCartItems((current) => {
        const existing = current.find((line) => line.id === lineId);
        if (existing) return current.map((line) => line.id === lineId ? { ...line, quantity: line.quantity + input.quantity } : line);
        return [...current, { ...input, id: lineId }];
      });
      if (input.vehicleKey && !savedVehicleKeys.includes(input.vehicleKey)) setSavedVehicleKeys((current) => [...current, input.vehicleKey!]);
      if (input.vehicleKey) setSelectedVehicleKey(input.vehicleKey);
      setCartOpen(true);
      toast.success("Added to cart", { description: "Your build list has been updated." });
    },
    removeFromCart(lineId) { setCartItems((current) => current.filter((line) => line.id !== lineId)); },
    updateQuantity(lineId, quantity) {
      if (quantity <= 0) { setCartItems((current) => current.filter((line) => line.id !== lineId)); return; }
      setCartItems((current) => current.map((line) => line.id === lineId ? { ...line, quantity } : line));
    },
    openCart() { setCartOpen(true); },
    closeCart() { setCartOpen(false); },
    setSelectedVehicle(vehicleKey) {
      setSelectedVehicleKey(vehicleKey);
      if (vehicleKey && !savedVehicleKeys.includes(vehicleKey)) setSavedVehicleKeys((current) => [...current, vehicleKey]);
      toast.success(vehicleKey ? "Vehicle selected" : "Vehicle cleared", { description: vehicleKey ? `${getVehicleRecordByKey(vehicleKey)?.label ?? "Selected vehicle saved to your garage."}` : "You can choose another vehicle at any time." });
    },
    toggleWishlist(productSlug) { setWishlist((current) => current.includes(productSlug) ? current.filter((slug) => slug !== productSlug) : [...current, productSlug]); },
    isWishlisted(productSlug) { return wishlist.includes(productSlug); },
  };

  return <StorefrontContext.Provider value={value}>{children}<Toaster position="bottom-right" theme="dark" /></StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("useStorefront must be used inside Providers");
  return context;
}
