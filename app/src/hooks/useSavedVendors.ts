import { createContext, useContext, useState, useCallback } from 'react';

interface SavedVendorsState {
  saved: Map<string, any>;
  isSaved: (id: string) => boolean;
  toggle: (vendor: any) => void;
}

const SavedVendorsContext = createContext<SavedVendorsState>({
  saved: new Map(),
  isSaved: () => false,
  toggle: () => {},
});

export function useSavedVendors() {
  return useContext(SavedVendorsContext);
}

export { SavedVendorsContext };

export function useSavedVendorsProvider() {
  const [saved, setSaved] = useState<Map<string, any>>(new Map());

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  const toggle = useCallback((vendor: any) => {
    setSaved((prev) => {
      const next = new Map(prev);
      if (next.has(vendor.id)) {
        next.delete(vendor.id);
      } else {
        next.set(vendor.id, vendor);
      }
      return next;
    });
  }, []);

  return { saved, isSaved, toggle };
}
