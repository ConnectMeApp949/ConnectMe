import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, CheckIcon, XIcon } from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'HelpTopic'>;

const TOPIC_CONTENT: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  'How to Book a Vendor': {
    title: 'How to Book a Vendor',
    sections: [
      { heading: 'Finding a vendor', body: 'Use the Explore tab to browse vendors in your area. You can filter by category, price range, rating, and availability date to find the perfect match for your event.' },
      { heading: 'Viewing vendor details', body: 'Tap on any vendor card to see their full profile, including photos, bio, pricing, reviews, and service area.' },
      { heading: 'Requesting a booking', body: 'Tap the "Book Now" button at the bottom of a vendor\'s profile. Fill in your event details including date, time, location, guest count, and any special requirements.' },
      { heading: 'Confirmation', body: 'After submitting your request, the vendor will review it and respond within 24 hours. You\'ll receive a notification when they confirm or suggest changes.' },
      { heading: 'Payment', body: 'Your payment method is authorized when you submit the booking request, but you won\'t be charged until the vendor confirms. A 5% service fee is added to help maintain the ConnectMe platform.' },
    ],
  },
  'How to Cancel a Booking': {
    title: 'How to Cancel a Booking',
    sections: [
      { heading: 'Cancellation policy', body: 'You can cancel a booking for free up to 48 hours before the event date. Cancellations within 48 hours may be subject to a 50% charge.' },
      { heading: 'How to cancel', body: 'Go to the Bookings tab, find the booking you want to cancel, tap on it to open the details, then tap "Cancel Booking". You\'ll be asked to confirm before the cancellation is processed.' },
      { heading: 'Refunds', body: 'If you cancel more than 48 hours before the event, you\'ll receive a full refund to your original payment method within 5-10 business days. Partial refunds for late cancellations are processed automatically.' },
    ],
  },
  'Payment and Refunds': {
    title: 'Payment and Refunds',
    sections: [
      { heading: 'Accepted payment methods', body: 'ConnectMe accepts all major credit and debit cards (Visa, Mastercard, American Express, Discover) as well as PayPal.' },
      { heading: 'Service fee', body: 'A 5% service fee is added to each booking. This fee helps cover platform costs, secure payment processing, and customer support.' },
      { heading: 'When you\'re charged', body: 'Your payment method is authorized when you submit a booking request, but the charge is only captured after the vendor confirms your booking.' },
      { heading: 'Refund timeline', body: 'Refunds are processed within 1-2 business days after cancellation. It may take 5-10 business days for the refund to appear on your statement, depending on your bank.' },
      { heading: 'Disputes', body: 'If you have an issue with a charge, contact our support team through Live Chat or email. We\'ll investigate and resolve the issue promptly.' },
    ],
  },
  'Managing Your Account': {
    title: 'Managing Your Account',
    sections: [
      { heading: 'Edit your profile', body: 'Go to Profile tab → View Profile to update your photo, name, and bio. Go to Account Settings to change your email, phone, or password.' },
      { heading: 'Payment methods', body: 'Go to Profile → Account Settings → Payment Methods to add, remove, or update your credit cards and PayPal.' },
      { heading: 'Notifications', body: 'Go to Profile → Account Settings → Notifications to control which push notifications, emails, and SMS messages you receive.' },
      { heading: 'Delete account', body: 'Go to Profile → Privacy → Delete My Account. This action is permanent and cannot be undone. All your data, bookings, and reviews will be removed.' },
    ],
  },
  'Reporting an Issue': {
    title: 'Reporting an Issue',
    sections: [
      { heading: 'Report a vendor', body: 'If you had a negative experience with a vendor, you can report them through their profile page or by contacting our support team. We take all reports seriously and investigate thoroughly.' },
      { heading: 'Report a safety concern', body: 'If you feel unsafe at any point, please contact local authorities first. Then report the incident to ConnectMe through Live Chat or email so we can take appropriate action.' },
      { heading: 'Technical issues', body: 'If the app isn\'t working correctly, try closing and reopening it first. If the problem persists, contact us through Live Chat or email with a description of the issue and any screenshots.' },
      { heading: 'Billing disputes', body: 'If you see an incorrect charge, contact our support team immediately. We\'ll review the transaction and process any necessary corrections within 48 hours.' },
    ],
  },
  'Accessibility': {
    title: 'Accessibility',
    sections: [
      { heading: 'Our commitment', body: 'ConnectMe is committed to making our platform accessible to everyone. We follow WCAG 2.1 guidelines and continuously work to improve the accessibility of our app.' },
      { heading: 'Screen readers', body: 'ConnectMe is compatible with VoiceOver (iOS) and TalkBack (Android). All interactive elements include accessibility labels.' },
      { heading: 'Text size', body: 'The app respects your device\'s text size settings. You can increase the text size in your phone\'s Settings → Display & Brightness → Text Size.' },
      { heading: 'Feedback', body: 'If you encounter any accessibility barriers while using ConnectMe, please let us know through Live Chat or email. Your feedback helps us improve.' },
    ],
  },
};

export default function HelpTopicScreen({ navigation, route }: Props) {
  const { colors: themeColors } = useTheme();
  const topicName = (route.params as any)?.topic ?? '';
  const content = TOPIC_CONTENT[topicName];

  if (!content) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <View style={[s.header, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
          <Text style={[s.headerTitle, { color: themeColors.text }]}>Help</Text>
          <View style={s.backBtn} />
        </View>
        <View style={s.empty}><Text style={[s.emptyText, { color: themeColors.textSecondary }]}>Topic not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6}><ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Help</Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={[s.title, { color: themeColors.text }]}>{content.title}</Text>
        {content.sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={[s.sectionHeading, { color: themeColors.text }]}>{section.heading}</Text>
            <Text style={[s.sectionBody, { color: themeColors.textSecondary }]}>{section.body}</Text>
          </View>
        ))}

        <View style={[s.helpfulCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[s.helpfulTitle, { color: themeColors.text }]}>Was this helpful?</Text>
          <View style={s.helpfulRow}>
            <TouchableOpacity style={[s.helpfulBtn, { borderColor: themeColors.border }]} activeOpacity={0.7} accessibilityLabel="Yes, this was helpful" accessibilityRole="button">
              <View style={s.helpfulBtnContent}>
                <CheckIcon size={16} color="#16A34A" strokeWidth={2} />
                <Text style={[s.helpfulBtnText, { color: themeColors.text }]}>Yes</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[s.helpfulBtn, { borderColor: themeColors.border }]} activeOpacity={0.7} accessibilityLabel="No, this was not helpful" accessibilityRole="button">
              <View style={s.helpfulBtnContent}>
                <XIcon size={16} color="#DC2626" strokeWidth={2} />
                <Text style={[s.helpfulBtnText, { color: themeColors.text }]}>No</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.contactBtn} activeOpacity={0.7} onPress={() => navigation.navigate('GetHelp')} accessibilityLabel="Still need help? Contact us" accessibilityRole="link">
          <Text style={[s.contactBtnText, { color: colors.primary }]}>Still need help? Contact us</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionHeading: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginBottom: 6 },
  sectionBody: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 23 },
  helpfulCard: { backgroundColor: colors.cardBackground, borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  helpfulTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: 12 },
  helpfulRow: { flexDirection: 'row', gap: 12 },
  helpfulBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  helpfulBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpfulBtnText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  contactBtn: { alignItems: 'center' },
  contactBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary, textDecorationLine: 'underline' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
});
