import { VendorDetail } from '../vendor-detail/types';

export interface BookingDraft {
  eventType?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  guestCount?: number;
  eventLocation?: string;
  locationNotes?: string;
  specialRequirements?: string;
}

export type BookingFlowParamList = {
  EventDetails: { vendor: VendorDetail; draft?: BookingDraft };
  Location: { vendor: VendorDetail; draft: BookingDraft };
  SpecialRequests: { vendor: VendorDetail; draft: BookingDraft };
  PricingReview: { vendor: VendorDetail; draft: BookingDraft };
  Payment: { vendor: VendorDetail; draft: BookingDraft; clientSecret: string; bookingId: string };
  Confirmation: { vendor: VendorDetail; bookingId: string };
};
