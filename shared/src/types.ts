// ─── Enums ───────────────────────────────────────────────

export enum UserType {
  VENDOR = 'VENDOR',
  CLIENT = 'CLIENT',
}

export enum VendorCategory {
  FOOD_TRUCK = 'FOOD_TRUCK',
  DJ = 'DJ',
  CATERING = 'CATERING',
  WEDDING_SERVICES = 'WEDDING_SERVICES',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  ENTERTAINMENT = 'ENTERTAINMENT',
  EXPERIENCES = 'EXPERIENCES',
  WELLNESS = 'WELLNESS',
  BEVERAGES = 'BEVERAGES',
  OTHER = 'OTHER',
}

export enum PriceUnit {
  PER_HOUR = 'PER_HOUR',
  PER_EVENT = 'PER_EVENT',
  CUSTOM = 'CUSTOM',
}

export enum SubscriptionTier {
  SPARK = 'SPARK',
  IGNITE = 'IGNITE',
  AMPLIFY = 'AMPLIFY',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
}

// ─── Models ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhoto: string | null;
  userType: UserType;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  category: VendorCategory;
  bio: string | null;
  coverPhoto: string | null;
  portfolioPhotos: string[];
  basePrice: number;
  priceUnit: PriceUnit;
  city: string;
  state: string;
  serviceRadius: number;
  isActive: boolean;
  subscriptionTier: SubscriptionTier;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  vendorId: string;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  eventLocation: string;
  eventType: string;
  guestCount: number | null;
  specialRequirements: string | null;
  status: BookingStatus;
  totalAmount: number;
  vendorFee: number;
  clientFee: number;
  platformRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  vendorId: string;
  rating: number;
  comment: string | null;
  vendorResponse: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string;
  amount: number;
  vendorPayout: number;
  platformFee: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface Subscription {
  id: string;
  vendorId: string;
  tier: SubscriptionTier;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isActive: boolean;
}
