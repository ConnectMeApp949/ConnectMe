import { createContext, useContext, useState, useCallback } from 'react';

export interface SavedSearch {
  id: string;
  query: string;
  category: string;
  maxPrice: number;
  minRating: number;
  eventDate: string | null;
  alertsEnabled: boolean;
  savedAt: string;
}

interface SavedSearchesState {
  searches: SavedSearch[];
  addSearch: (search: Omit<SavedSearch, 'id' | 'savedAt' | 'alertsEnabled'>) => void;
  removeSearch: (id: string) => void;
  toggleAlert: (id: string) => void;
  hasSearch: (query: string, category: string) => boolean;
}

export const SavedSearchesContext = createContext<SavedSearchesState>({
  searches: [],
  addSearch: () => {},
  removeSearch: () => {},
  toggleAlert: () => {},
  hasSearch: () => false,
});

export function useSavedSearches() {
  return useContext(SavedSearchesContext);
}

export function useSavedSearchesProvider(): SavedSearchesState {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  const addSearch = useCallback(
    (search: Omit<SavedSearch, 'id' | 'savedAt' | 'alertsEnabled'>) => {
      setSearches((prev) => {
        const exists = prev.some(
          (s) =>
            s.query.toLowerCase() === search.query.toLowerCase() &&
            s.category === search.category,
        );
        if (exists) return prev;
        const newSearch: SavedSearch = {
          ...search,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          alertsEnabled: true,
          savedAt: new Date().toISOString(),
        };
        return [newSearch, ...prev];
      });
    },
    [],
  );

  const removeSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s,
      ),
    );
  }, []);

  const hasSearch = useCallback(
    (query: string, category: string) => {
      return searches.some(
        (s) =>
          s.query.toLowerCase() === query.toLowerCase() &&
          s.category === category,
      );
    },
    [searches],
  );

  return { searches, addSearch, removeSearch, toggleAlert, hasSearch };
}
