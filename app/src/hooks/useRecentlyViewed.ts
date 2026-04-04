import { createContext, useContext, useState, useCallback } from 'react';

interface RecentlyViewedState {
  recentlyViewed: any[];
  addViewed: (vendor: any) => void;
}

export const RecentlyViewedContext = createContext<RecentlyViewedState>({
  recentlyViewed: [],
  addViewed: () => {},
});

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}

const MAX_RECENTLY_VIEWED = 10;

export function useRecentlyViewedProvider() {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  const addViewed = useCallback((vendor: any) => {
    if (!vendor?.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((v) => v.id !== vendor.id);
      return [vendor, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
    });
  }, []);

  return { recentlyViewed, addViewed };
}
