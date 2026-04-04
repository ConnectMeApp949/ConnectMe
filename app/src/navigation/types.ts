import { VendorDraft } from '../screens/vendor-setup/types';
import { VendorDetail } from '../screens/vendor-detail/types';

export type OnboardingStackParamList = {
  Walkthrough: undefined;
  Welcome: undefined;
  SignUp: { email?: string } | undefined;
  SignIn: { email?: string } | undefined;
  ForgotPassword: { email?: string } | undefined;
  VendorType: undefined;
};

export type VendorSetupStackParamList = {
  BusinessName: { draft?: VendorDraft };
  Category: { draft: VendorDraft };
  Bio: { draft: VendorDraft };
  Pricing: { draft: VendorDraft };
  Location: { draft: VendorDraft };
  Photos: { draft: VendorDraft };
  Preview: { draft: VendorDraft };
};

export type MainStackParamList = {
  Home: undefined;
  Search: undefined;
  VendorDetail: { vendor: VendorDetail };
  BookingRequest: { vendor: VendorDetail };
};

export type RootStackParamList = {
  Onboarding: undefined;
  VendorSetup: undefined;
  Main: undefined;
};
