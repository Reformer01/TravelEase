
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TravelService = {
  id: string;
  basketId?: string; // Unique ID for the specific instance in the basket
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  provider: string;
  price: number;
  rating: number;
  image: string;
  location?: string;
  date?: string;
};

interface BasketContextType {
  items: TravelService[];
  addToBasket: (item: TravelService) => void;
  removeFromBasket: (basketId: string) => void;
  clearBasket: () => void;
  totalPrice: number;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<TravelService[]>([]);

  const addToBasket = (item: TravelService) => {
    // Create a unique basketId so that duplicate items (same service id) 
    // don't cause key collisions and can be removed individually.
    const uniqueItem = {
      ...item,
      basketId: `${item.id}-${Math.random().toString(36).substr(2, 9)}`
    };
    setItems((prev) => [...prev, uniqueItem]);
  };

  const removeFromBasket = (basketId: string) => {
    setItems((prev) => prev.filter((item) => item.basketId !== basketId));
  };

  const clearBasket = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  return (
    <BasketContext.Provider value={{ items, addToBasket, removeFromBasket, clearBasket, totalPrice }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
}
