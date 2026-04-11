import React, { useState, useEffect } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingStackParamList } from './src/navigation/types';
import { colors, fonts, lightColors, darkColors } from './src/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import {
  SearchIcon,
  HeartIcon,
  HeartFilledIcon,
  CalendarIcon,
  MessageIcon,
  UserIcon,
  DashboardIcon,
} from './src/components/Icons';

// Onboarding screens
import { OnboardingWalkthroughScreen, checkHasSeenOnboarding, WelcomeScreen, SignUpScreen, SignInScreen, VendorTypeScreen } from './src/screens/onboarding';
import ForgotPasswordScreen from './src/screens/onboarding/ForgotPasswordScreen';

// Tab screens
import { HomeScreen } from './src/screens/home';
import BookingsScreen from './src/screens/bookings/BookingsScreen';
import InboxScreen from './src/screens/messages/InboxScreen';
import ChatScreen from './src/screens/messages/ChatScreen';
import WishlistsScreen from './src/screens/wishlists/WishlistsScreen';
import RequestBookingScreen from './src/screens/bookings/RequestBookingScreen';
import BookingConfirmationScreen from './src/screens/bookings/BookingConfirmationScreen';
import CancelBookingScreen from './src/screens/bookings/CancelBookingScreen';
import ModifyBookingScreen from './src/screens/bookings/ModifyBookingScreen';
import ReceiptScreen from './src/screens/bookings/ReceiptScreen';
import TipScreen from './src/screens/bookings/TipScreen';

// Stack screens
import { SearchScreen, CompareVendorsScreen } from './src/screens/search';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';

// Vendor dashboard screens
import { BookingManagementScreen } from './src/screens/vendor-dashboard';
import { ReviewsScreen } from './src/screens/reviews';

// Planner
import EventPlannerScreen from './src/screens/planner/EventPlannerScreen';

// Vendor screens
import VendorDashboardScreen from './src/screens/vendor/VendorDashboardScreen';
import VendorBookingsScreen from './src/screens/vendor/VendorBookingsScreen';
import VendorEarningsScreen from './src/screens/vendor/VendorEarningsScreen';
import VendorEditListingScreen from './src/screens/vendor/VendorEditListingScreen';
import VendorPayoutSettingsScreen from './src/screens/vendor/VendorPayoutSettingsScreen';
import VendorCalendarScreen from './src/screens/vendor/VendorCalendarScreen';
import EditPhotosScreen from './src/screens/vendor/EditPhotosScreen';
import EditDescriptionScreen from './src/screens/vendor/EditDescriptionScreen';
import EditPricingScreen from './src/screens/vendor/EditPricingScreen';
import VendorAnalyticsScreen from './src/screens/vendor/VendorAnalyticsScreen';
import EditLocationScreen from './src/screens/vendor/EditLocationScreen';
import EditCategoryScreen from './src/screens/vendor/EditCategoryScreen';
import EditRadiusScreen from './src/screens/vendor/EditRadiusScreen';
import EditBookingQuestionsScreen from './src/screens/vendor/EditBookingQuestionsScreen';
import ReviewClientScreen from './src/screens/vendor/ReviewClientScreen';

// Hooks
import { SavedVendorsContext, useSavedVendorsProvider } from './src/hooks/useSavedVendors';
import { RecentlyViewedContext, useRecentlyViewedProvider } from './src/hooks/useRecentlyViewed';
import { SavedSearchesContext, useSavedSearchesProvider } from './src/hooks/useSavedSearches';
import { VendorDetailScreen } from './src/screens/vendor-detail';
import { ProfileScreen } from './src/screens/profile';
import PastBookingsScreen from './src/screens/profile/PastBookingsScreen';
import BookingDetailScreen from './src/screens/profile/BookingDetailScreen';
import ConnectionsScreen from './src/screens/profile/ConnectionsScreen';
import AccountSettingsScreen from './src/screens/profile/AccountSettingsScreen';
import ViewProfileScreen from './src/screens/profile/ViewProfileScreen';
import GetHelpScreen from './src/screens/profile/GetHelpScreen';
import HelpTopicScreen from './src/screens/profile/HelpTopicScreen';
import PrivacyScreen from './src/screens/profile/PrivacyScreen';
import ReferVendorScreen from './src/screens/profile/ReferVendorScreen';
import LegalScreen from './src/screens/profile/LegalScreen';
import LegalDocScreen from './src/screens/profile/LegalDocScreen';
import PaymentMethodsScreen from './src/screens/profile/PaymentMethodsScreen';
import AddCardScreen from './src/screens/profile/AddCardScreen';
import PayoutPreferencesScreen from './src/screens/profile/PayoutPreferencesScreen';
import SetupPayoutsScreen from './src/screens/profile/SetupPayoutsScreen';
import MyReviewsScreen from './src/screens/profile/MyReviewsScreen';
import LeaveReviewScreen from './src/screens/profile/LeaveReviewScreen';
import ReportScreen from './src/screens/profile/ReportScreen';
import BecomeVendorScreen from './src/screens/profile/BecomeVendorScreen';
import VendorStep1Screen from './src/screens/profile/VendorStep1Screen';
import VendorBusinessTypeScreen from './src/screens/profile/VendorBusinessTypeScreen';
import VendorLocationScreen from './src/screens/profile/VendorLocationScreen';
import VendorNameScreen from './src/screens/profile/VendorNameScreen';
import VendorDescriptionScreen from './src/screens/profile/VendorDescriptionScreen';
import VendorPhotosScreen from './src/screens/profile/VendorPhotosScreen';
import VendorPricingScreen from './src/screens/profile/VendorPricingScreen';
import VendorReviewPublishScreen from './src/screens/profile/VendorReviewPublishScreen';

import { AuthContext, AuthState, useAuth } from './src/context/AuthContext';
export { useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Suppress noisy warnings in production builds
if (!__DEV__) {
  LogBox.ignoreAllLogs();
}

// ─── Navigation ──────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const ExploreStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const slide = { animation: 'slide_from_right' as const };
const noHeader = { headerShown: false as const };

function OnboardingNavigator() {
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState<boolean | null>(null);

  useEffect(() => {
    checkHasSeenOnboarding().then(setHasSeenWalkthrough);
  }, []);

  // Wait until we know whether to show the walkthrough
  if (hasSeenWalkthrough === null) return null;

  return (
    <OnboardingStack.Navigator
      initialRouteName={hasSeenWalkthrough ? 'Welcome' : 'Walkthrough'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <OnboardingStack.Screen name="Walkthrough" component={OnboardingWalkthroughScreen} />
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="SignUp" component={SignUpScreen} />
      <OnboardingStack.Screen name="SignIn" component={SignInScreen} />
      <OnboardingStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <OnboardingStack.Screen name="VendorType" component={VendorTypeScreen} />
    </OnboardingStack.Navigator>
  );
}

function ExploreNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={noHeader}>
      <ExploreStack.Screen name="HomeScreen" component={HomeScreen} />
      <ExploreStack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
      <ExploreStack.Screen name="VendorDetail" component={VendorDetailScreen} options={slide} />
      <ExploreStack.Screen name="Notifications" component={NotificationsScreen} options={slide} />
      <ExploreStack.Screen name="RequestBooking" component={RequestBookingScreen} options={slide} />
      <ExploreStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ animation: 'slide_from_right', gestureEnabled: false }} />
      <ExploreStack.Screen name="CompareVendors" component={CompareVendorsScreen} options={slide} />
      <ExploreStack.Screen name="VendorReviews" component={ReviewsScreen} options={slide} />
      <ExploreStack.Screen name="Report" component={ReportScreen} options={slide} />
      <ExploreStack.Screen name="EventPlanner" component={EventPlannerScreen} options={slide} />
    </ExploreStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={noHeader}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PastBookings" component={PastBookingsScreen} options={slide} />
      <ProfileStack.Screen name="BookingDetail" component={BookingDetailScreen} options={slide} />
      <ProfileStack.Screen name="Connections" component={ConnectionsScreen} options={slide} />
      <ProfileStack.Screen name="AccountSettings" component={AccountSettingsScreen} options={slide} />
      <ProfileStack.Screen name="ViewProfile" component={ViewProfileScreen} options={slide} />
      <ProfileStack.Screen name="GetHelp" component={GetHelpScreen} options={slide} />
      <ProfileStack.Screen name="HelpTopic" component={HelpTopicScreen} options={slide} />
      <ProfileStack.Screen name="Privacy" component={PrivacyScreen} options={slide} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={slide} />
      <ProfileStack.Screen name="AddCard" component={AddCardScreen} options={slide} />
      <ProfileStack.Screen name="PayoutPreferences" component={PayoutPreferencesScreen} options={slide} />
      <ProfileStack.Screen name="SetupPayouts" component={SetupPayoutsScreen} options={slide} />
      <ProfileStack.Screen name="ReferVendor" component={ReferVendorScreen} options={slide} />
      <ProfileStack.Screen name="Legal" component={LegalScreen} options={slide} />
      <ProfileStack.Screen name="LegalDoc" component={LegalDocScreen} options={slide} />
      <ProfileStack.Screen name="MyReviews" component={MyReviewsScreen} options={slide} />
      <ProfileStack.Screen name="LeaveReview" component={LeaveReviewScreen} options={slide} />
      <ProfileStack.Screen name="BecomeVendor" component={BecomeVendorScreen} options={slide} />
      <ProfileStack.Screen name="VendorStep1" component={VendorStep1Screen} options={slide} />
      <ProfileStack.Screen name="VendorBusinessType" component={VendorBusinessTypeScreen} options={slide} />
      <ProfileStack.Screen name="VendorLocation" component={VendorLocationScreen} options={slide} />
      <ProfileStack.Screen name="VendorName" component={VendorNameScreen} options={slide} />
      <ProfileStack.Screen name="VendorDescription" component={VendorDescriptionScreen} options={slide} />
      <ProfileStack.Screen name="VendorPhotos" component={VendorPhotosScreen} options={slide} />
      <ProfileStack.Screen name="VendorPricing" component={VendorPricingScreen} options={slide} />
      <ProfileStack.Screen name="VendorReviewPublish" component={VendorReviewPublishScreen} options={slide} />
      <ProfileStack.Screen name="VendorDetail" component={VendorDetailScreen} options={slide} />
      <ProfileStack.Screen name="CancelBooking" component={CancelBookingScreen} options={slide} />
      <ProfileStack.Screen name="ModifyBooking" component={ModifyBookingScreen} options={slide} />
      <ProfileStack.Screen name="Receipt" component={ReceiptScreen} options={slide} />
      <ProfileStack.Screen name="Tip" component={TipScreen} options={slide} />
      <ProfileStack.Screen name="Report" component={ReportScreen} options={slide} />
      <ProfileStack.Screen name="EventPlanner" component={EventPlannerScreen} options={slide} />
    </ProfileStack.Navigator>
  );
}

// Messages stack (used in both client and vendor tabs)
const MessagesStack = createNativeStackNavigator();
function MessagesNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={noHeader}>
      <MessagesStack.Screen name="Inbox" component={InboxScreen} />
      <MessagesStack.Screen name="ChatScreen" component={ChatScreen} options={slide} />
    </MessagesStack.Navigator>
  );
}

// Vendor dashboard stack
const VendorDashStack = createNativeStackNavigator();
function VendorDashNavigator() {
  return (
    <VendorDashStack.Navigator screenOptions={noHeader}>
      <VendorDashStack.Screen name="VendorDashboard" component={VendorDashboardScreen} />
      <VendorDashStack.Screen name="VendorBookings" component={VendorBookingsScreen} options={slide} />
      <VendorDashStack.Screen name="VendorEarnings" component={VendorEarningsScreen} options={slide} />
      <VendorDashStack.Screen name="VendorEditListing" component={VendorEditListingScreen} options={slide} />
      <VendorDashStack.Screen name="VendorCalendar" component={VendorCalendarScreen} options={slide} />
      <VendorDashStack.Screen name="EditPhotos" component={EditPhotosScreen} options={slide} />
      <VendorDashStack.Screen name="EditDescription" component={EditDescriptionScreen} options={slide} />
      <VendorDashStack.Screen name="EditPricing" component={EditPricingScreen} options={slide} />
      <VendorDashStack.Screen name="EditLocation" component={EditLocationScreen} options={slide} />
      <VendorDashStack.Screen name="EditCategory" component={EditCategoryScreen} options={slide} />
      <VendorDashStack.Screen name="EditRadius" component={EditRadiusScreen} options={slide} />
      <VendorDashStack.Screen name="EditBookingQuestions" component={EditBookingQuestionsScreen} options={slide} />
      <VendorDashStack.Screen name="ReviewClient" component={ReviewClientScreen} options={slide} />
      <VendorDashStack.Screen name="VendorPayoutSettings" component={VendorPayoutSettingsScreen} options={slide} />
      <VendorDashStack.Screen name="BookingManagement" component={BookingManagementScreen} options={slide} />
      <VendorDashStack.Screen name="Reviews" component={ReviewsScreen} options={slide} />
      <VendorDashStack.Screen name="ChatScreen" component={ChatScreen} options={slide} />
      <VendorDashStack.Screen name="VendorAnalytics" component={VendorAnalyticsScreen} options={slide} />
    </VendorDashStack.Navigator>
  );
}

// Vendor bottom tabs
const VendorTab = createBottomTabNavigator();
function VendorTabs() {
  return (
    <VendorTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabStyles.tabLabel,
      }}
    >
      <VendorTab.Screen name="Dashboard" component={VendorDashNavigator} options={{ tabBarIcon: ({ focused }) => <DashboardIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }} />
      {/* VendorBookingsScreen is registered here for direct tab access AND in VendorDashStack for dashboard navigation */}
      <VendorTab.Screen name="Bookings" component={VendorBookingsScreen} options={{ tabBarIcon: ({ focused }) => <CalendarIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }} />
      <VendorTab.Screen name="Messages" component={MessagesNavigator} options={{ tabBarIcon: ({ focused }) => <MessageIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }} />
      <VendorTab.Screen name="Profile" component={ProfileNavigator} options={{ tabBarIcon: ({ focused }) => <UserIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }} />
    </VendorTab.Navigator>
  );
}

function MainTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabStyles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreNavigator}
        options={{ tabBarLabel: t('explore'), tabBarIcon: ({ focused }) => <SearchIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }}
      />
      <Tab.Screen
        name="Wishlists"
        component={WishlistsScreen}
        options={{ tabBarLabel: t('wishlists'), tabBarIcon: ({ focused }) => focused ? <HeartFilledIcon size={22} color={colors.secondary} /> : <HeartIcon size={22} color={colors.textMuted} /> }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarLabel: t('bookings'), tabBarIcon: ({ focused }) => <CalendarIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }}
      />
      <Tab.Screen
        name="Messages"
        component={InboxScreen}
        options={{ tabBarLabel: t('messages'), tabBarIcon: ({ focused }) => <MessageIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ tabBarLabel: t('profile'), tabBarIcon: ({ focused }) => <UserIcon size={22} color={focused ? colors.secondary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} /> }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    height: 85,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 2,
  },
});

// ─── Root ────────────────────────────────────────────────

function AppContent() {
  const { isDark } = useTheme();
  const { user, isVendorMode } = useAuth();

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, primary: darkColors.primary, background: darkColors.background, card: darkColors.cardBackground, text: darkColors.text, border: darkColors.border },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: lightColors.primary, background: lightColors.background, card: lightColors.cardBackground, text: lightColors.text, border: lightColors.border },
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? darkColors.background : lightColors.background }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={navTheme}
          // @ts-ignore – deep linking config types are overly strict for dynamic navigators
          linking={{
            prefixes: ['connectme://', 'https://connectmeapp.services'],
            config: {
              screens: {
                Main: {
                  screens: {
                    Explore: {
                      screens: {
                        HomeScreen: '',
                        Search: 'search',
                        VendorDetail: 'vendor/:id',
                        Notifications: 'notifications',
                        RequestBooking: 'book/:id',
                        BookingConfirmation: 'booking-confirmation',
                        EventPlanner: 'event-planner',
                        CompareVendors: 'compare',
                      },
                    },
                    Wishlists: 'wishlists',
                    Bookings: 'bookings',
                    Messages: 'messages',
                    Profile: {
                      screens: {
                        ProfileMain: 'profile',
                        AccountSettings: 'profile/settings',
                        ViewProfile: 'profile/view',
                        GetHelp: 'help',
                        HelpTopic: 'help/:topic',
                        Privacy: 'profile/privacy',
                        Legal: 'legal',
                        LegalDoc: 'legal/:doc',
                        PaymentMethods: 'profile/payments',
                        MyReviews: 'profile/reviews',
                        BecomeVendor: 'become-vendor',
                      },
                    },
                  },
                },
                VendorMain: {
                  screens: {
                    Dashboard: {
                      screens: {
                        VendorDashboard: 'vendor-dashboard',
                        VendorBookings: 'vendor-bookings',
                        VendorEarnings: 'vendor-earnings',
                        VendorEditListing: 'vendor-edit',
                        VendorCalendar: 'vendor-calendar',
                        VendorAnalytics: 'vendor-analytics',
                      },
                    },
                  },
                },
                Onboarding: {
                  screens: {
                    Walkthrough: 'walkthrough',
                    Welcome: 'welcome',
                    SignIn: 'signin',
                    SignUp: 'signup',
                    ForgotPassword: 'forgot-password',
                  },
                },
              },
            },
          }}
        >
          <RootStack.Navigator screenOptions={noHeader}>
            {isVendorMode && user ? (
              <RootStack.Screen name="VendorMain" component={VendorTabs} />
            ) : (
              <RootStack.Screen name="Main" component={MainTabs} />
            )}
            {!user && (
              <RootStack.Screen name="Onboarding" component={OnboardingNavigator} options={{ presentation: 'modal' }} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isVendorMode, setIsVendorMode] = useState(false);
  const savedVendors = useSavedVendorsProvider();
  const recentlyViewed = useRecentlyViewedProvider();
  const savedSearches = useSavedSearchesProvider();

  const authValue: AuthState = {
    user,
    token,
    isVendorMode,
    login: (u, t) => { setUser(u); setToken(t); },
    logout: () => { setUser(null); setToken(null); setIsVendorMode(false); },
    toggleVendorMode: () => setIsVendorMode((v) => !v),
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={authValue}>
        <SavedVendorsContext.Provider value={savedVendors}>
        <RecentlyViewedContext.Provider value={recentlyViewed}>
        <SavedSearchesContext.Provider value={savedSearches}>
        <QueryClientProvider client={queryClient}>
          <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51TG1VgECfXBYZgZGMbENz8uj7BlJF3FLpi9GhCqQb5BYQn4yc9dW3XHbYnnKIZ7dFDmutG5IKe8BpO75oYfHrG6E005gIGjxDk'}>
          <ThemeProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </ThemeProvider>
          </StripeProvider>
        </QueryClientProvider>
        </SavedSearchesContext.Provider>
        </RecentlyViewedContext.Provider>
        </SavedVendorsContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
