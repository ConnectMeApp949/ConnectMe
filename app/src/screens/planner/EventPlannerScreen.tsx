import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import {
  ChevronLeftIcon,
  PlusIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  UserIcon,
  DollarIcon,
  MusicIcon,
  UtensilsIcon,
  CameraIcon,
  SparklesIcon,
  ShareIcon,
  XIcon,
  ChevronRightIcon,
  TruckIcon,
  CompassIcon,
  WellnessIcon,
} from '../../components/Icons';

// ─── Types ───────────────────────────────────────────────

type VendorStatus = 'Needed' | 'Booked' | 'Confirmed';

interface ChecklistItem {
  id: string;
  category: string;
  icon: 'music' | 'catering' | 'photography' | 'decorations' | 'entertainment' | 'transportation' | 'experiences' | 'wellness';
  vendorName: string | null;
  budget: number;
  status: VendorStatus;
  completed: boolean;
}

interface PlannerEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  checklist: ChecklistItem[];
  notes: string;
  expanded: boolean;
}

// ─── Helpers ─────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function todayString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const DEFAULT_CHECKLIST: () => ChecklistItem[] = () => [
  { id: generateId(), category: 'DJ / Music', icon: 'music', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Catering / Food', icon: 'catering', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Photography', icon: 'photography', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Decorations', icon: 'decorations', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Entertainment', icon: 'entertainment', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Experiences', icon: 'experiences', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Wellness', icon: 'wellness', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: generateId(), category: 'Transportation', icon: 'transportation', vendorName: null, budget: 0, status: 'Needed', completed: false },
];

const DEMO_CHECKLIST: ChecklistItem[] = [
  { id: 'demo-1', category: 'DJ / Music', icon: 'music', vendorName: 'DJ Smooth Beats', budget: 800, status: 'Booked', completed: false },
  { id: 'demo-2', category: 'Catering / Food', icon: 'catering', vendorName: 'Fiesta Flavors Catering', budget: 2500, status: 'Confirmed', completed: true },
  { id: 'demo-3', category: 'Photography', icon: 'photography', vendorName: 'Lena Rose Photography', budget: 1200, status: 'Booked', completed: false },
  { id: 'demo-4', category: 'Decorations', icon: 'decorations', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: 'demo-5', category: 'Entertainment', icon: 'entertainment', vendorName: null, budget: 0, status: 'Needed', completed: false },
  { id: 'demo-6', category: 'Transportation', icon: 'transportation', vendorName: 'SA Limo Co.', budget: 600, status: 'Booked', completed: false },
];

const INITIAL_EVENTS: PlannerEvent[] = [
  {
    id: 'demo-event-1',
    name: 'Summer Birthday Bash',
    date: '2026-06-15',
    location: 'San Antonio, TX',
    guestCount: 75,
    totalBudget: 8000,
    checklist: DEMO_CHECKLIST,
    notes: 'Theme: tropical vibes. Need to confirm DJ set times by May 1st. Coordinate arrival with photographer.',
    expanded: true,
  },
  {
    id: 'default-event',
    name: 'My Event',
    date: todayString(),
    location: '',
    guestCount: 0,
    totalBudget: 0,
    checklist: DEFAULT_CHECKLIST(),
    notes: '',
    expanded: false,
  },
];

// ─── Category icon resolver ─────────────────────────────

function CategoryIcon({ icon, size = 20, color }: { icon: string; size?: number; color?: string }) {
  const c = color ?? colors.primary;
  switch (icon) {
    case 'music':
      return <MusicIcon size={size} color={c} />;
    case 'catering':
      return <UtensilsIcon size={size} color={c} />;
    case 'photography':
      return <CameraIcon size={size} color={c} />;
    case 'decorations':
      return <SparklesIcon size={size} color={c} />;
    case 'entertainment':
      return <SparklesIcon size={size} color={c} />;
    case 'experiences':
      return <CompassIcon size={size} color={c} />;
    case 'wellness':
      return <WellnessIcon size={size} color={c} />;
    case 'transportation':
      return <TruckIcon size={size} color={c} />;
    default:
      return <CheckIcon size={size} color={c} />;
  }
}

function statusColor(status: VendorStatus): string {
  switch (status) {
    case 'Confirmed':
      return colors.success;
    case 'Booked':
      return colors.primary;
    case 'Needed':
    default:
      return colors.textMuted;
  }
}

// Search category mapping for navigation
function searchCategoryFor(icon: string): string {
  switch (icon) {
    case 'music': return 'DJ';
    case 'catering': return 'CATERING';
    case 'photography': return 'PHOTOGRAPHY';
    case 'entertainment': return 'ENTERTAINMENT';
    case 'experiences': return 'EXPERIENCES';
    case 'wellness': return 'WELLNESS';
    case 'transportation': return 'FOOD_TRUCK'; // closest available
    case 'decorations': return 'WEDDING_SERVICES'; // closest available
    default: return '';
  }
}

// ─── Component ───────────────────────────────────────────

type Props = NativeStackScreenProps<any, 'EventPlanner'>;

export default function EventPlannerScreen({ navigation }: Props) {
  const { colors: themeColors } = useTheme();
  const [events, setEvents] = useState<PlannerEvent[]>(INITIAL_EVENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudgetEventId, setEditingBudgetEventId] = useState<string | null>(null);
  const [budgetText, setBudgetText] = useState('');

  // Create modal state
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState(todayString());
  const [newLocation, setNewLocation] = useState('');
  const [newGuests, setNewGuests] = useState('');

  // ─── Event CRUD ────────────────────────────────────────

  const createEvent = useCallback(() => {
    if (!newName.trim()) {
      Alert.alert('Name required', 'Please enter a name for your event.');
      return;
    }
    const event: PlannerEvent = {
      id: generateId(),
      name: newName.trim(),
      date: newDate || todayString(),
      location: newLocation.trim(),
      guestCount: parseInt(newGuests, 10) || 0,
      totalBudget: 0,
      checklist: DEFAULT_CHECKLIST(),
      notes: '',
      expanded: true,
    };
    setEvents((prev) => [event, ...prev]);
    setNewName('');
    setNewDate(todayString());
    setNewLocation('');
    setNewGuests('');
    setShowCreateModal(false);
  }, [newName, newDate, newLocation, newGuests]);

  const toggleExpand = useCallback((eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, expanded: !e.expanded } : e)),
    );
  }, []);

  const toggleChecklistItem = useCallback((eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          checklist: e.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          ),
        };
      }),
    );
  }, []);

  const updateNotes = useCallback((eventId: string, notes: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, notes } : e)),
    );
  }, []);

  const saveBudget = useCallback((eventId: string) => {
    const value = parseInt(budgetText.replace(/[^0-9]/g, ''), 10) || 0;
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, totalBudget: value } : e)),
    );
    setEditingBudgetEventId(null);
    setBudgetText('');
  }, [budgetText]);

  const handleShare = useCallback(() => {
    Alert.alert(
      'Share Event Plan',
      'How would you like to share this plan with a co-planner?',
      [
        { text: 'Copy Link', onPress: () => Alert.alert('Link Copied', 'A shareable link has been copied to your clipboard.') },
        { text: 'Text Message', onPress: () => Alert.alert('Share via Text', 'Opening text message composer.') },
        { text: 'Email', onPress: () => Alert.alert('Share via Email', 'Opening email composer.') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }, []);

  const handleAddVendor = useCallback((categoryIcon: string) => {
    const category = searchCategoryFor(categoryIcon);
    navigation.navigate('Search', { category });
  }, [navigation]);

  // ─── Budget calculations ───────────────────────────────

  function getSpent(checklist: ChecklistItem[]): number {
    return checklist
      .filter((item) => item.status === 'Booked' || item.status === 'Confirmed')
      .reduce((sum, item) => sum + item.budget, 0);
  }

  // ─── Render helpers ────────────────────────────────────

  function renderBudgetTracker(event: PlannerEvent) {
    const spent = getSpent(event.checklist);
    const remaining = Math.max(0, event.totalBudget - spent);
    const progress = event.totalBudget > 0 ? Math.min(1, spent / event.totalBudget) : 0;
    const isEditing = editingBudgetEventId === event.id;

    return (
      <View style={styles.budgetSection} accessibilityRole="summary" accessibilityLabel={`Budget tracker: $${spent} spent of $${event.totalBudget} total`}>
        <View style={styles.budgetHeader}>
          <DollarIcon size={18} color={colors.primary} />
          <Text style={styles.budgetTitle}>Budget</Text>
        </View>

        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total</Text>
            {isEditing ? (
              <View style={styles.budgetEditRow}>
                <Text style={styles.budgetCurrency}>$</Text>
                <TextInput
                  style={styles.budgetInput}
                  value={budgetText}
                  onChangeText={setBudgetText}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  accessibilityLabel="Enter total budget"
                  onSubmitEditing={() => saveBudget(event.id)}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={() => saveBudget(event.id)}
                  accessibilityLabel="Save budget"
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <CheckIcon size={18} color={colors.success} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditingBudgetEventId(event.id);
                  setBudgetText(event.totalBudget > 0 ? String(event.totalBudget) : '');
                }}
                accessibilityLabel="Edit total budget"
                accessibilityRole="button"
                accessibilityHint="Tap to set your total event budget"
              >
                <Text style={styles.budgetValue}>
                  ${event.totalBudget.toLocaleString()}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={[styles.budgetValue, { color: colors.primary }]}>
              ${spent.toLocaleString()}
            </Text>
          </View>

          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetValue, { color: colors.success }]}>
              ${remaining.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: progress > 0.9 ? colors.error : progress > 0.7 ? colors.warning : colors.primary,
              },
            ]}
          />
        </View>
        {event.totalBudget > 0 && (
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% of budget used
          </Text>
        )}
      </View>
    );
  }

  function renderChecklistItem(event: PlannerEvent, item: ChecklistItem) {
    return (
      <View key={item.id} style={[styles.checklistItem, item.completed && styles.checklistItemCompleted]}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
          onPress={() => toggleChecklistItem(event.id, item.id)}
          accessibilityLabel={`${item.category}, ${item.completed ? 'completed' : 'not completed'}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
        >
          {item.completed && <CheckIcon size={14} color={colors.white} strokeWidth={3} />}
        </TouchableOpacity>

        {/* Icon + content */}
        <View style={styles.checklistIcon}>
          <CategoryIcon icon={item.icon} size={18} color={item.completed ? colors.textMuted : colors.primary} />
        </View>

        <View style={styles.checklistContent}>
          <Text style={[styles.checklistCategory, item.completed && styles.checklistCategoryDone]}>
            {item.category}
          </Text>
          {item.vendorName ? (
            <Text style={styles.checklistVendor}>{item.vendorName}</Text>
          ) : null}
          <View style={styles.checklistMeta}>
            {item.budget > 0 && (
              <Text style={styles.checklistBudget}>${item.budget.toLocaleString()}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.status)}18` }]}>
              <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Add vendor button */}
        {!item.vendorName && !item.completed && (
          <TouchableOpacity
            style={styles.addVendorBtn}
            onPress={() => handleAddVendor(item.icon)}
            accessibilityLabel={`Find vendor for ${item.category}`}
            accessibilityRole="button"
            accessibilityHint={`Searches for ${item.category} vendors`}
          >
            <PlusIcon size={14} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.addVendorText}>Find</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderEventCard(event: PlannerEvent) {
    const completedCount = event.checklist.filter((i) => i.completed).length;
    const totalCount = event.checklist.length;

    return (
      <View key={event.id} style={styles.eventCard}>
        {/* Card header (tappable to expand) */}
        <TouchableOpacity
          style={styles.eventHeader}
          onPress={() => toggleExpand(event.id)}
          activeOpacity={0.7}
          accessibilityLabel={`${event.name}, ${event.expanded ? 'collapse' : 'expand'} details`}
          accessibilityRole="button"
          accessibilityState={{ expanded: event.expanded }}
        >
          <View style={styles.eventHeaderLeft}>
            <Text style={styles.eventName}>{event.name}</Text>
            <View style={styles.eventMetaRow}>
              <CalendarIcon size={13} color={colors.textSecondary} />
              <Text style={styles.eventMetaText}>{formatDate(event.date)}</Text>
              {event.location ? (
                <>
                  <MapPinIcon size={13} color={colors.textSecondary} />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                </>
              ) : null}
              {event.guestCount > 0 && (
                <>
                  <UserIcon size={13} color={colors.textSecondary} />
                  <Text style={styles.eventMetaText}>{event.guestCount} guests</Text>
                </>
              )}
            </View>
            <Text style={styles.eventProgress}>
              {completedCount}/{totalCount} vendors confirmed
            </Text>
          </View>
          <View style={[styles.expandArrow, event.expanded && styles.expandArrowRotated]}>
            <ChevronRightIcon size={20} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Expanded content */}
        {event.expanded && (
          <View style={styles.eventBody}>
            {/* Budget tracker */}
            {renderBudgetTracker(event)}

            {/* Vendor checklist */}
            <View style={styles.checklistSection}>
              <Text style={styles.sectionLabel} accessibilityRole="header">Vendor Checklist</Text>
              {event.checklist.map((item) => renderChecklistItem(event, item))}
            </View>

            {/* Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionLabel} accessibilityRole="header">Notes</Text>
              <TextInput
                style={styles.notesInput}
                multiline
                value={event.notes}
                onChangeText={(text) => updateNotes(event.id, text)}
                placeholder="Add notes about your event..."
                placeholderTextColor={colors.textMuted}
                textAlignVertical="top"
                accessibilityLabel="Event notes"
                accessibilityHint="Enter any notes about your event"
              />
            </View>

            {/* Share button */}
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.7}
              accessibilityLabel="Share plan with co-planner"
              accessibilityRole="button"
            >
              <ShareIcon size={18} color={colors.white} />
              <Text style={styles.shareBtnText}>Share plan with co-planner</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ─── Main render ───────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Planner</Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={styles.addBtn}
          accessibilityLabel="Create new event"
          accessibilityRole="button"
          accessibilityHint="Opens a form to create a new event plan"
        >
          <PlusIcon size={22} color={colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Event list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {events.map((event) => renderEventCard(event))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SafeAreaView style={styles.modalSafe}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <XIcon size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Event</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              {/* Event name */}
              <Text style={styles.inputLabel}>Event Name</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Birthday Party, Wedding, Corporate Event"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Event name"
                returnKeyType="next"
              />

              {/* Date */}
              <Text style={styles.inputLabel}>Date</Text>
              <View style={styles.inputWithIcon}>
                <CalendarIcon size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.inputInner}
                  value={newDate}
                  onChangeText={setNewDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Event date"
                  returnKeyType="next"
                />
              </View>

              {/* Location */}
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.inputWithIcon}>
                <MapPinIcon size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.inputInner}
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="City, State or Venue Name"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Event location"
                  returnKeyType="next"
                />
              </View>

              {/* Guest count */}
              <Text style={styles.inputLabel}>Guest Count</Text>
              <View style={styles.inputWithIcon}>
                <UserIcon size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.inputInner}
                  value={newGuests}
                  onChangeText={setNewGuests}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  accessibilityLabel="Number of guests"
                  returnKeyType="done"
                />
              </View>

              {/* Create button */}
              <TouchableOpacity
                style={styles.createBtn}
                onPress={createEvent}
                activeOpacity={0.8}
                accessibilityLabel="Create event"
                accessibilityRole="button"
              >
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ─── Header ──────────────────────────────────── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  /* ─── Scroll ──────────────────────────────────── */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },

  /* ─── Event card ──────────────────────────────── */
  eventCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  eventHeaderLeft: {
    flex: 1,
  },
  eventName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  eventMetaText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
  },
  eventProgress: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  expandArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  expandArrowRotated: {
    transform: [{ rotate: '90deg' }],
  },

  /* ─── Event body (expanded) ───────────────────── */
  eventBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  /* ─── Budget tracker ──────────────────────────── */
  budgetSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  budgetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetValue: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  budgetEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  budgetCurrency: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  budgetInput: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    minWidth: 60,
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },

  /* ─── Checklist section ───────────────────────── */
  checklistSection: {
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
    backgroundColor: colors.background,
  },
  checklistItemCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checklistIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checklistContent: {
    flex: 1,
  },
  checklistCategory: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
  },
  checklistCategoryDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  checklistVendor: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  checklistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  checklistBudget: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  addVendorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addVendorText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.primary,
  },

  /* ─── Notes section ───────────────────────────── */
  notesSection: {
    paddingTop: spacing.md,
  },
  notesInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    minHeight: 80,
    lineHeight: 20,
  },

  /* ─── Share button ────────────────────────────── */
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  shareBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },

  /* ─── Modal ───────────────────────────────────── */
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: 10,
  },
  inputInner: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 14,
  },
  createBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
  },
});
