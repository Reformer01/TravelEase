
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TravelService = {
  id: string;
  basketId?: string;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load basket from localStorage on mount
  useEffect(() => {
    const savedBasket = localStorage.getItem('travelease_basket');
    if (savedBasket) {
      try {
        setItems(JSON.parse(savedBasket));
      } catch (e) {
        console.error("Failed to parse basket", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save basket to localStorage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('travelease_basket', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToBasket = (item: TravelService) => {
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
    localStorage.removeItem('travelease_basket');
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
