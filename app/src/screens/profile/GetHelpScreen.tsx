import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { CalendarIcon, XIcon, DollarIcon, UserIcon, AlertCircleIcon, AccessibilityIcon, SearchIcon, MessageIcon, MailIcon, ExternalLinkIcon, ChevronRightIcon, ChevronLeftIcon } from '../../components/Icons';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any, 'GetHelp'>;

type IconComp = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

const TOPICS: { Icon: IconComp; label: string }[] = [
  { Icon: CalendarIcon, label: 'How to Book a Vendor' },
  { Icon: XIcon, label: 'How to Cancel a Booking' },
  { Icon: DollarIcon, label: 'Payment and Refunds' },
  { Icon: UserIcon, label: 'Managing Your Account' },
  { Icon: AlertCircleIcon, label: 'Reporting an Issue' },
  { Icon: AccessibilityIcon, label: 'Accessibility' },
];

export default function GetHelpScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const filteredTopics = TOPICS.filter(t => t.label.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={themeColors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: themeColors.text }]}>Get Help</Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={[s.searchBar, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <SearchIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
          <TextInput style={[s.searchInput, { color: themeColors.text }]} placeholder="Search help topics" placeholderTextColor={themeColors.textMuted} value={searchText} onChangeText={setSearchText} accessibilityLabel="Search help topics" accessibilityRole="search" />
        </View>

        <Text style={[s.sectionTitle, { color: themeColors.text }]}>Common Topics</Text>
        {filteredTopics.map(t => {
          const TopicIcon = t.Icon;
          return (
            <TouchableOpacity key={t.label} style={[s.topicRow, { borderBottomColor: themeColors.border }]} activeOpacity={0.6} onPress={() => navigation.navigate('HelpTopic', { topic: t.label })} accessibilityLabel={t.label} accessibilityRole="button" accessibilityHint={`View help for ${t.label}`}>
              <View style={[s.topicIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <TopicIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[s.topicLabel, { color: themeColors.text }]}>{t.label}</Text>
              <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
            </TouchableOpacity>
          );
        })}

        <Text style={[s.sectionTitle, { marginTop: 28, color: themeColors.text }]}>Contact Us</Text>
        <View style={s.contactRow}>
          <TouchableOpacity style={[s.contactCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={() => Alert.alert('Live Chat', 'Connecting you to a support agent...\n\nOur team is available Monday–Friday, 9am–6pm CST.', [{ text: 'Start Chat', style: 'default' }, { text: 'Cancel', style: 'cancel' }])} accessibilityLabel="Live Chat" accessibilityRole="button" accessibilityHint="Start a live chat with support">
            <View style={[s.contactIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <MessageIcon size={24} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[s.contactTitle, { color: themeColors.text }]}>Live Chat</Text>
            <Text style={[s.contactSub, { color: themeColors.textMuted }]}>Available 9am – 6pm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.contactCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]} activeOpacity={0.7} onPress={async () => {
              const mailto = 'mailto:support@connectmeapp.services?subject=Help Request';
              const supported = await Linking.canOpenURL(mailto);
              if (supported) {
                Linking.openURL(mailto);
              } else {
                Alert.alert(
                  'Email Us',
                  'support@connectmeapp.services\n\nNo mail app is configured on this device. Copy the address above and send us an email from your preferred mail app.',
                  [{ text: 'OK' }],
                );
              }
            }} accessibilityLabel="Email Us" accessibilityRole="button" accessibilityHint="Send an email to support">
            <View style={[s.contactIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <MailIcon size={24} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[s.contactTitle, { color: themeColors.text }]}>Email Us</Text>
            <Text style={[s.contactSub, { color: themeColors.textMuted }]}>Response within 24 hours</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.helpCenterRow, { borderTopColor: themeColors.border }]} activeOpacity={0.6} onPress={() => WebBrowser.openBrowserAsync('https://connectmeapp.services/contact')} accessibilityLabel="Visit Help Center" accessibilityRole="link" accessibilityHint="Opens the help center in a browser">
          <View style={s.helpCenterLeft}>
            <View style={[s.helpCenterIconWrap, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
              <ExternalLinkIcon size={20} color={themeColors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[s.helpCenterText, { color: themeColors.text }]}>Visit Help Center</Text>
          </View>
          <ChevronRightIcon size={18} color={themeColors.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 48, marginBottom: 24, gap: 10 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginBottom: 12 },
  topicRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  topicIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginRight: 14 },
  topicLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, flex: 1 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  contactIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  contactTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  contactSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  helpCenterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border },
  helpCenterLeft: { flexDirection: 'row', alignItems: 'center' },
  helpCenterIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.cardBackground, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginRight: 14 },
  helpCenterText: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
});
