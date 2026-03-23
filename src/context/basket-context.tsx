"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateAndRefreshSessionCached, fetchWithRetry, handleSessionExpired } from '@/lib/session-utils';
import { useAuth, useUser } from '@/supabase';
import { DateString } from '@/types/dates';

const GUEST_BASKET_KEY = 'travelease_guest_basket_v1';

function normalizeGuestItems(raw: any): TravelService[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(Boolean)
    .map((it: any) => {
      const base: TravelService = {
        id: String(it.id),
        basketId: String(it.basketId || it.id),
        type: it.type,
        title: String(it.title || ''),
        provider: String(it.provider || ''),
        price: Number(it.price || 0),
        rating: Number(it.rating || 0),
        image: String(it.image || ''),
        location: it.location ? String(it.location) : undefined,
        date: it.date ? String(it.date) : undefined,
      };
      return base;
    });
}

export type TravelService = {
  id: string;
  basketId?: string;
  type: 'flight' | 'hotel' | 'activity' | 'car';
  title: string;
  provider: string;
  price: number;
  rating: number;
  image: string;
  location?: string;
  date?: DateString;
};

interface BasketContextType {
  items: TravelService[];
  addToBasket: (item: TravelService) => void;
  removeFromBasket: (basketId: string) => void;
  clearBasket: () => void;
  totalPrice: number;
  isLoading: boolean;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<TravelService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const auth = useAuth();

  const readGuestBasket = (): TravelService[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(GUEST_BASKET_KEY);
      if (!raw) return [];
      return normalizeGuestItems(JSON.parse(raw));
    } catch {
      return [];
    }
  };

  const writeGuestBasket = (nextItems: TravelService[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GUEST_BASKET_KEY, JSON.stringify(nextItems));
    } catch {
      // ignore
    }
  };

  const clearGuestBasket = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_BASKET_KEY);
  };

  const safeReadJson = async (response: Response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    const { data, error } = await auth.auth.getSession();
    if (error) {
      console.error('Failed to get Supabase session', error);
      return null;
    }
    return data.session?.access_token ?? null;
  };

  useEffect(() => {
    const fetchBasket = async () => {
      if (!user) {
        setItems(readGuestBasket());
        setIsLoading(false);
        return;
      }

      try {
        const accessToken = await getAccessToken();
        const response = await fetch('/api/basket', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });

        const json = await safeReadJson(response);

        if (response.status === 401) {
          setItems([]);
          return;
        }

        if (response.ok && json && Array.isArray((json as any).items)) {
          const serverItems = (json as any).items as TravelService[];
          const guestItems = readGuestBasket();

          if (guestItems.length === 0) {
            setItems(serverItems);
            return;
          }

          const merged = [...serverItems];
          const extras = guestItems.filter((g) => !serverItems.some((s) => s.id === g.id));
          merged.push(...extras);
          setItems(merged);

          if (extras.length > 0 && accessToken) {
            for (const extra of extras) {
              try {
                await fetch('/api/basket', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({ item: extra }),
                });
              } catch (e) {
                console.error('Failed to sync guest basket item', e);
              }
            }
          }

          clearGuestBasket();
        } else {
          console.error('Failed to load basket', { status: response.status, body: json });
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching basket', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBasket();
  }, [user]);

  const addToBasket = async (item: TravelService) => {
    if (!user) {
      const nextItem: TravelService = { ...item, basketId: item.basketId || item.id };
      const next = [...items, nextItem];
      setItems(next);
      writeGuestBasket(next);
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/basket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ item }),
      });
      const json = await safeReadJson(response);
      if (response.ok && Array.isArray((json as any)?.items)) {
        setItems((json as any).items);
      }
    } catch (error) {
      console.error('Failed to add item to basket', error);
    }
  };

  const removeFromBasket = async (basketId: string) => {
    if (!user) {
      const next = items.filter((it) => (it.basketId || it.id) !== basketId);
      setItems(next);
      writeGuestBasket(next);
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(`/api/basket?basketId=${encodeURIComponent(basketId)}`, {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const json = await safeReadJson(response);
      if (response.ok && Array.isArray((json as any)?.items)) {
        setItems((json as any).items);
      }
    } catch (error) {
      console.error('Failed to remove basket item', error);
    }
  };

  const clearBasket = async () => {
    if (!user) {
      setItems([]);
      clearGuestBasket();
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/basket?clear=1', {
        method: 'DELETE',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const json = await safeReadJson(response);
      if (response.ok) {
        setItems((json as any)?.items || []);
      }
    } catch (error) {
      console.error('Failed to clear basket', error);
    }
  };

  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  return (
    <BasketContext.Provider value={{ items, addToBasket, removeFromBasket, clearBasket, totalPrice, isLoading }}>
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
