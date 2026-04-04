import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import prisma from './prisma';

const expo = new Expo();

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    // Look up user's push token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
      console.log(`[Notification] No valid push token for user ${userId}`);
      return;
    }

    const message: ExpoPushMessage = {
      to: user.pushToken,
      title,
      body,
      data: data ?? {},
      sound: 'default',
    };

    const [result] = await expo.sendPushNotificationsAsync([message]);
    console.log(`[Notification] Sent to ${userId}: "${title}"`, result);
  } catch (err) {
    console.error(`[Notification] Failed for user ${userId}:`, err);
  }
}

// Batch send for scheduled jobs
export async function sendBatchNotifications(
  notifications: { userId: string; title: string; body: string; data?: Record<string, string> }[]
): Promise<void> {
  for (const n of notifications) {
    await sendPushNotification(n.userId, n.title, n.body, n.data);
  }
}
