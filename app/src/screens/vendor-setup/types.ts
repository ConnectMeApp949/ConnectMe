export interface VendorDraft {
  businessName?: string;
  category?: string;
  bio?: string;
  basePrice?: string;
  priceUnit?: string;
  city?: string;
  state?: string;
  serviceRadius?: number;
  photos?: string[];
}

export type VendorSetupParamList = {
  BusinessName: { draft?: VendorDraft };
  Category: { draft: VendorDraft };
  Bio: { draft: VendorDraft };
  Pricing: { draft: VendorDraft };
  Location: { draft: VendorDraft };
  Photos: { draft: VendorDraft };
  Preview: { draft: VendorDraft };
};

export interface PriceUnitOption {
  id: string;
  label: string;
}

export const CATEGORIES = [
  { id: 'FOOD_TRUCK', label: 'Food Truck', icon: 'truck' },
  { id: 'DJ', label: 'Event Entertainment', icon: 'music' },
  { id: 'CATERING', label: 'Catering', icon: 'utensils' },
  { id: 'WEDDING_SERVICES', label: 'Wedding Services', icon: 'rings' },
  { id: 'PHOTOGRAPHY', label: 'Photography', icon: 'aperture' },
  { id: 'ENTERTAINMENT', label: 'Entertainment', icon: 'sparkles' },
  { id: 'OTHER', label: 'Other', icon: 'sparkles' },
] as const;
