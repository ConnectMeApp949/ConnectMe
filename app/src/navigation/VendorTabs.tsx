import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/vendor-dashboard';
import { BookingManagementScreen } from '../screens/vendor-dashboard';
import { MessagesScreen } from '../screens/messages';
import { ProfileScreen } from '../screens/profile';
import { DashboardIcon, CalendarIcon, MessageIcon, FileTextIcon, UserIcon } from '../components/Icons';
import { colors, fonts } from '../theme';

// Placeholder for vendor listings
function ListingsTab() {
  return null; // TODO: Create VendorListingsScreen
}

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Dashboard: DashboardIcon,
  BookingManagement: CalendarIcon,
  Messages: MessageIcon,
  Listings: FileTextIcon,
  Profile: UserIcon,
};

export default function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const Icon = TAB_ICONS[route.name];
          if (!Icon) return null;
          return <Icon size={22} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2 : 1.5} />;
        },
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="BookingManagement" component={BookingManagementScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Listings" component={ListingsTab} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.medium, fontSize: 11 },
  tabBar: {
    backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1,
    paddingTop: 4, height: 80,
  },
});
