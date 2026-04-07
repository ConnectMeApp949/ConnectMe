import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme';
import { ChevronLeftIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'LegalDoc'>;

const DOCS: Record<string, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  'Privacy Policy': {
    title: 'Privacy Policy',
    lastUpdated: 'March 1, 2026',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect information you provide directly, such as your name, email address, phone number, profile photo, and payment information when you create an account or make a booking.\n\nWe also automatically collect certain information when you use ConnectMe, including your device type, operating system, IP address, and general location data to show you vendors in your area.' },
      { heading: '2. How We Use Your Information', body: 'We use your information to:\n\n• Provide, maintain, and improve ConnectMe services\n• Process bookings and payments between clients and vendors\n• Send you booking confirmations, reminders, and support messages\n• Personalize your experience and show relevant vendors\n• Detect and prevent fraud, abuse, and security incidents\n• Comply with legal obligations' },
      { heading: '3. Information Sharing', body: 'We share your information only in the following circumstances:\n\n• With vendors when you submit a booking request (your name, event details, and contact info)\n• With payment processors (Stripe) to process transactions\n• With service providers who help us operate the platform\n• When required by law or to protect the rights and safety of our users\n\nWe never sell your personal information to third parties.' },
      { heading: '4. Data Retention', body: 'We retain your account information for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are required by law to retain certain records (such as transaction history for tax purposes).' },
      { heading: '5. Your Rights and Choices', body: 'You have the right to:\n\n• Access and download your personal data\n• Correct inaccurate information in your profile\n• Delete your account and associated data\n• Opt out of marketing communications\n• Control location sharing and other privacy settings\n\nYou can manage these preferences in your Privacy settings or by contacting support.' },
      { heading: '6. Cookies and Tracking', body: 'We use cookies and similar technologies to remember your preferences, keep you logged in, and understand how you use ConnectMe. You can manage cookie preferences through your device settings.' },
      { heading: '7. Data Security', body: 'We implement industry-standard security measures to protect your information, including encryption in transit (TLS) and at rest, secure payment processing through Stripe, and regular security audits. However, no method of transmission over the internet is 100% secure.' },
      { heading: '8. Children\'s Privacy', body: 'ConnectMe is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will delete it promptly.' },
      { heading: '9. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification at least 30 days before they take effect.' },
      { heading: '10. Contact Us', body: 'If you have questions about this Privacy Policy or our data practices, please contact us at:\n\nConnectMe Inc.\nSan Antonio, TX\nprivacy@connectmeapp.services' },
    ],
  },
  'Terms of Service': {
    title: 'Terms of Service',
    lastUpdated: 'March 1, 2026',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'By accessing or using ConnectMe, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use our services. ConnectMe reserves the right to modify these terms at any time, with notice provided to registered users.' },
      { heading: '2. About ConnectMe', body: 'ConnectMe is a marketplace platform that connects clients with event service vendors (DJs, caterers, photographers, food trucks, and more). ConnectMe facilitates the connection and booking process but is not a party to the agreements between clients and vendors.' },
      { heading: '3. Account Registration', body: 'You must create an account to use ConnectMe. You agree to:\n\n• Provide accurate and complete information\n• Maintain the security of your account credentials\n• Notify us immediately of any unauthorized access\n• Be at least 18 years old\n\nYou are responsible for all activity that occurs under your account.' },
      { heading: '4. Booking and Payments', body: 'When you submit a booking request, your payment method is authorized but not charged until the vendor confirms. A 5% service fee is applied to each booking to support platform operations.\n\nAll payments are processed securely through Stripe. ConnectMe does not store your full credit card information.' },
      { heading: '5. Cancellation Policy', body: 'Clients may cancel a confirmed booking:\n\n• More than 48 hours before the event: Full refund\n• Within 48 hours of the event: 50% refund\n• No-show: No refund\n\nVendors who cancel confirmed bookings may be subject to penalties, including reduced visibility on the platform.' },
      { heading: '6. Vendor Responsibilities', body: 'Vendors on ConnectMe agree to:\n\n• Provide accurate business information and pricing\n• Respond to booking requests within 24 hours\n• Deliver services as described in their listing\n• Maintain all required licenses and insurance\n• Comply with all applicable local, state, and federal laws' },
      { heading: '7. Prohibited Conduct', body: 'You may not:\n\n• Use ConnectMe for any illegal purpose\n• Harass, threaten, or discriminate against other users\n• Post false, misleading, or fraudulent content\n• Attempt to circumvent ConnectMe\'s payment system\n• Scrape, copy, or redistribute platform content\n• Create multiple accounts or impersonate others' },
      { heading: '8. Reviews and Content', body: 'Users may leave reviews after a completed booking. Reviews must be honest, relevant, and based on a genuine experience. ConnectMe reserves the right to remove reviews that violate our content guidelines.\n\nBy posting content on ConnectMe, you grant us a non-exclusive, worldwide license to use, display, and distribute that content on the platform.' },
      { heading: '9. Limitation of Liability', body: 'ConnectMe is a marketplace platform and is not responsible for the quality, safety, or legality of vendor services. We do not guarantee vendor availability, and we are not liable for any damages arising from interactions between clients and vendors.\n\nOur total liability to you shall not exceed the amount of fees you have paid to ConnectMe in the 12 months preceding the claim.' },
      { heading: '10. Dispute Resolution', body: 'Any disputes between you and ConnectMe will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in San Antonio, Texas. You agree to waive any right to a jury trial or to participate in a class action.' },
      { heading: '11. Termination', body: 'ConnectMe may suspend or terminate your account at any time for violation of these terms or for any conduct that we determine is harmful to the platform, other users, or our business interests. You may delete your account at any time through your Privacy settings.' },
      { heading: '12. Contact', body: 'For questions about these Terms of Service, contact us at:\n\nConnectMe Inc.\nSan Antonio, TX\nlegal@connectmeapp.services' },
    ],
  },
  'Cookie Policy': {
    title: 'Cookie Policy',
    lastUpdated: 'March 1, 2026',
    sections: [
      { heading: '1. What Are Cookies', body: 'Cookies are small text files stored on your device when you use ConnectMe. They help us remember your preferences, keep you logged in, and understand how you interact with our platform.' },
      { heading: '2. Types of Cookies We Use', body: 'Essential Cookies: Required for the platform to function, such as authentication and security tokens.\n\nFunctional Cookies: Remember your preferences like language and location settings.\n\nAnalytics Cookies: Help us understand how users interact with ConnectMe so we can improve the experience.' },
      { heading: '3. Managing Cookies', body: 'You can manage or delete cookies through your device settings. Note that disabling essential cookies may prevent certain features from working properly.' },
      { heading: '4. Contact', body: 'For questions about our cookie practices, contact privacy@connectmeapp.services.' },
    ],
  },
  'Open Source Licenses': {
    title: 'Open Source Licenses',
    lastUpdated: 'March 1, 2026',
    sections: [
      { heading: 'Overview', body: 'ConnectMe is built using a variety of open source software. We are grateful to the open source community for their contributions. Below are the major open source packages used in this application.' },
      { heading: 'React Native', body: 'Copyright (c) Meta Platforms, Inc. and affiliates.\nLicensed under the MIT License.' },
      { heading: 'Expo', body: 'Copyright (c) 2015-present 650 Industries, Inc. (aka Expo).\nLicensed under the MIT License.' },
      { heading: 'React Navigation', body: 'Copyright (c) 2017 React Navigation Contributors.\nLicensed under the MIT License.' },
      { heading: 'Other Packages', body: 'Full license information for all packages can be found in the project\'s node_modules directory or by visiting the respective package pages on npmjs.com.' },
    ],
  },
  'Accessibility Statement': {
    title: 'Accessibility Statement',
    lastUpdated: 'March 1, 2026',
    sections: [
      { heading: 'Our Commitment', body: 'ConnectMe is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.' },
      { heading: 'Standards', body: 'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make digital content more accessible to people with a wide range of disabilities.' },
      { heading: 'Features', body: 'ConnectMe includes the following accessibility features:\n\n• Compatible with VoiceOver (iOS) and TalkBack (Android)\n• All interactive elements include accessibility labels\n• Support for Dynamic Type / system font scaling\n• Sufficient color contrast ratios throughout the app\n• Touch targets meet minimum size guidelines (44×44 points)' },
      { heading: 'Feedback', body: 'We welcome your feedback on the accessibility of ConnectMe. If you encounter accessibility barriers, please contact us:\n\nEmail: accessibility@connectmeapp.services\n\nWe aim to respond to feedback within 2 business days.' },
    ],
  },
};

export default function LegalDocScreen({ navigation, route }: Props) {
  const docName = (route.params as any)?.doc ?? '';
  const doc = DOCS[docName];

  if (!doc) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button"><ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} /></TouchableOpacity>
          <Text style={s.headerTitle}>Legal</Text>
          <View style={s.backBtn} />
        </View>
        <View style={s.empty}><Text style={s.emptyText}>Document not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6}><ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} /></TouchableOpacity>
        <Text style={s.headerTitle}>{doc.title}</Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.updated}>Last updated: {doc.lastUpdated}</Text>
        {doc.sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionHeading}>{section.heading}</Text>
            <Text style={s.sectionBody}>{section.body}</Text>
          </View>
        ))}
        <View style={s.footer}>
          <Text style={s.footerText}>ConnectMe Inc. · San Antonio, TX</Text>
          <Text style={s.footerText}>Version 1.0.0</Text>
        </View>
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
  updated: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionHeading: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, marginBottom: 8 },
  sectionBody: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, lineHeight: 23 },
  footer: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  footerText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
});
