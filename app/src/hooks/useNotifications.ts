import { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { apiHeaders } from '../services/headers';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const { token: authToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotifications().then((t) => {
      if (t) {
        setToken(t);
        saveTokenToServer(t, authToken ?? undefined);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      switch (data?.type) {
        case 'booking':
          Linking.openURL('connectme://bookings');
          break;
        case 'message':
          Linking.openURL('connectme://messages');
          break;
        case 'review':
          Linking.openURL('connectme://profile/reviews');
          break;
        default:
          Linking.openURL('connectme://notifications');
          break;
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return { token };
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return tokenData.data;
}

async function saveTokenToServer(pushToken: string, authToken?: string): Promise<void> {
  try {
    await fetch(`${API_URL}/notifications/register-token`, {
      method: 'POST',
      headers: apiHeaders(authToken),
      body: JSON.stringify({ token: pushToken }),
    });
  } catch (err) {
    // Token registration failed silently; will retry on next launch
  }
}
