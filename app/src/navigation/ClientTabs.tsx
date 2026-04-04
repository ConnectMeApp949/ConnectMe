import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home';
import { SearchScreen } from '../screens/search';
import { MessagesScreen } from '../screens/messages';
import { ProfileScreen } from '../screens/profile';
import { HomeIcon, SearchIcon, CalendarIcon, MessageIcon, UserIcon } from '../components/Icons';
import { colors, fonts } from '../theme';

// Placeholder for bookings list
function BookingsTab() {
  return null; // TODO: Create ClientBookingsScreen
}

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Home: HomeIcon,
  Search: SearchIcon,
  Bookings: CalendarIcon,
  Messages: MessageIcon,
  Profile: UserIcon,
};

export default function ClientTabs() {
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookings" component={BookingsTab} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
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
