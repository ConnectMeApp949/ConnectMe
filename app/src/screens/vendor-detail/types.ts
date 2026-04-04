export interface VendorReview {
  id: string;
  rating: number;
  comment: string | null;
  vendorResponse: string | null;
  photos?: string[];
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

export interface VendorDetail {
  id: string;
  businessName: string;
  category: string;
  bio: string | null;
  coverPhoto: string | null;
  portfolioPhotos: string[];
  basePrice: number;
  priceUnit: string;
  city: string;
  state: string;
  serviceRadius: number;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
  recentReviews: VendorReview[];
}
