import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'EditBookingQuestions'>;

// ─── Types ─────────────────────────────────────────────

type QuestionType = 'short' | 'long' | 'yesno';

interface DefaultQuestion {
  id: string;
  text: string;
  locked: boolean; // always-on questions can't be toggled off
  enabled: boolean;
}

interface CustomQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short: 'Short',
  long: 'Long',
  yesno: 'Yes/No',
};

const QUESTION_TYPES: QuestionType[] = ['short', 'long', 'yesno'];

const MAX_CUSTOM_QUESTIONS = 5;

// ─── Initial data ──────────────────────────────────────

function buildDefaultQuestions(): DefaultQuestion[] {
  return [
    { id: 'dq-1', text: 'What type of event is this?', locked: true, enabled: true },
    { id: 'dq-2', text: 'How many guests?', locked: true, enabled: true },
    { id: 'dq-3', text: "What's your budget?", locked: false, enabled: true },
    { id: 'dq-4', text: 'Do you have a specific theme?', locked: false, enabled: true },
    { id: 'dq-5', text: 'Any special requirements?', locked: false, enabled: false },
  ];
}

// ─── Screen ────────────────────────────────────────────

export default function EditBookingQuestionsScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [defaults, setDefaults] = useState<DefaultQuestion[]>(buildDefaultQuestions);
  const [customs, setCustoms] = useState<CustomQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Default question toggles ─────────────────────────

  function toggleDefault(id: string) {
    setDefaults((prev) =>
      prev.map((q) =>
        q.id === id && !q.locked ? { ...q, enabled: !q.enabled } : q,
      ),
    );
  }

  // ─── Custom question management ───────────────────────

  function addCustomQuestion() {
    if (customs.length >= MAX_CUSTOM_QUESTIONS) {
      Alert.alert('Limit reached', `You can add up to ${MAX_CUSTOM_QUESTIONS} custom questions.`);
      return;
    }
    setCustoms((prev) => [
      ...prev,
      {
        id: `cq-${Date.now()}`,
        text: '',
        type: 'short',
        required: false,
      },
    ]);
  }

  function updateCustomText(id: string, text: string) {
    setCustoms((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q)),
    );
  }

  function updateCustomType(id: string, type: QuestionType) {
    setCustoms((prev) =>
      prev.map((q) => (q.id === id ? { ...q, type } : q)),
    );
  }

  function toggleCustomRequired(id: string) {
    setCustoms((prev) =>
      prev.map((q) => (q.id === id ? { ...q, required: !q.required } : q)),
    );
  }

  function deleteCustomQuestion(id: string) {
    Alert.alert('Delete question', 'Are you sure you want to remove this question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setCustoms((prev) => prev.filter((q) => q.id !== id)),
      },
    ]);
  }

  // ─── Save ─────────────────────────────────────────────

  async function handleSave() {
    // Validate custom questions have text
    const emptyCustom = customs.find((q) => q.text.trim().length === 0);
    if (emptyCustom) {
      Alert.alert('Missing question', 'Please fill in all custom question fields or remove empty ones.');
      return;
    }

    setIsSaving(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.connectmeapp.services';
      const res = await fetch(API_URL + '/vendor/booking-questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ defaults, customs }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to save booking questions');
      }
      Alert.alert('Saved', 'Your booking questions have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Booking Questions</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Explanation */}
        <Text style={s.explanation}>
          Customize the questions clients answer when requesting a booking. This helps you get the info you need upfront.
        </Text>

        {/* ─── Default questions ──────────────────────── */}
        <Text style={s.sectionTitle}>Default Questions</Text>

        {defaults.map((q) => (
          <View key={q.id} style={s.defaultRow}>
            <View style={s.defaultTextCol}>
              <Text style={[s.defaultText, !q.enabled && s.defaultTextDisabled]}>
                {q.text}
              </Text>
              {q.locked && (
                <Text style={s.lockedLabel}>Always on</Text>
              )}
            </View>
            <Switch
              value={q.enabled}
              onValueChange={() => toggleDefault(q.id)}
              disabled={q.locked}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              accessibilityLabel={`Toggle "${q.text}"`}
            />
          </View>
        ))}

        {/* ─── Custom questions ───────────────────────── */}
        <View style={s.customHeader}>
          <Text style={s.sectionTitle}>Custom Questions</Text>
          <Text style={s.customCount}>
            {customs.length}/{MAX_CUSTOM_QUESTIONS}
          </Text>
        </View>

        {customs.map((q) => (
          <View key={q.id} style={s.customCard}>
            {/* Question text input */}
            <TextInput
              style={s.customInput}
              value={q.text}
              onChangeText={(t) => updateCustomText(q.id, t)}
              placeholder="Enter your question..."
              placeholderTextColor={colors.textMuted}
              maxLength={200}
              accessibilityLabel="Custom question text"
            />

            {/* Type selector (segmented control) */}
            <Text style={s.fieldLabel}>Answer type</Text>
            <View style={s.segmentedRow}>
              {QUESTION_TYPES.map((type) => {
                const isActive = q.type === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[s.segment, isActive && s.segmentActive]}
                    onPress={() => updateCustomType(q.id, type)}
                    activeOpacity={0.7}
                    accessibilityLabel={`${QUESTION_TYPE_LABELS[type]} answer type`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[s.segmentText, isActive && s.segmentTextActive]}>
                      {QUESTION_TYPE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Required toggle + delete */}
            <View style={s.customActions}>
              <View style={s.requiredRow}>
                <Text style={s.requiredLabel}>Required</Text>
                <Switch
                  value={q.required}
                  onValueChange={() => toggleCustomRequired(q.id)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                  accessibilityLabel="Toggle required"
                />
              </View>
              <TouchableOpacity
                onPress={() => deleteCustomQuestion(q.id)}
                style={s.deleteBtn}
                activeOpacity={0.6}
                accessibilityLabel="Delete question"
                accessibilityRole="button"
              >
                <TrashIcon size={18} color={colors.error} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add question button */}
        {customs.length < MAX_CUSTOM_QUESTIONS && (
          <TouchableOpacity
            style={s.addBtn}
            onPress={addCustomQuestion}
            activeOpacity={0.7}
            accessibilityLabel="Add custom question"
            accessibilityRole="button"
          >
            <PlusIcon size={18} color={colors.primary} strokeWidth={2} />
            <Text style={s.addBtnText}>Add Question</Text>
          </TouchableOpacity>
        )}

        {/* Save button */}
        <TouchableOpacity
          style={[s.saveBtn, isSaving && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
          accessibilityLabel="Save booking questions"
          accessibilityRole="button"
        >
          <CheckIcon size={18} color={colors.white} strokeWidth={2.5} />
          <Text style={s.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
  },

  scroll: { padding: 20 },

  // Explanation
  explanation: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  // Section title
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Default questions
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  defaultTextCol: { flex: 1, marginRight: spacing.md },
  defaultText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  defaultTextDisabled: { color: colors.textMuted },
  lockedLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Custom questions section
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  customCount: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },

  customCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  customInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  // Field label
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },

  // Segmented control
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.white,
  },

  // Actions row
  customActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requiredLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginRight: spacing.sm,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addBtnText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.primary,
    marginLeft: spacing.sm,
  },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
    marginLeft: spacing.sm,
  },
});
