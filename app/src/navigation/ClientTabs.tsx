import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/home';
import { SearchScreen } from '../screens/search';
import { MessagesScreen } from '../screens/messages';
import { ProfileScreen } from '../screens/profile';
import { HomeIcon, SearchIcon, CalendarIcon, MessageIcon, UserIcon } from '../components/Icons';
import { colors, fonts } from '../theme';

function BookingsTab() {
  return (
    <SafeAreaView style={bookingsStyles.container} edges={['top']}>
      <Text style={bookingsStyles.header}>Bookings</Text>
      <View style={bookingsStyles.empty}>
        <View style={bookingsStyles.iconWrap}>
          <CalendarIcon size={36} color={colors.textMuted} strokeWidth={1.5} />
        </View>
        <Text style={bookingsStyles.title}>No bookings yet</Text>
        <Text style={bookingsStyles.sub}>
          When you book a vendor, your upcoming and past bookings will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const bookingsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontFamily: fonts.bold, fontSize: 28, color: colors.text, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});

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
