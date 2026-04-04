import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius } from '../../theme';
import {
  ChevronLeftIcon, PlusIcon, TrashIcon, EditPencilIcon, XIcon,
} from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'EditPricing'>;

const UNITS = [
  { id: 'PER_HOUR', label: 'Per hour' },
  { id: 'PER_EVENT', label: 'Per event' },
  { id: 'CUSTOM', label: 'Custom quote' },
];

interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  duration: string;
}

interface AddOn {
  id: string;
  name: string;
  price: string;
}

const MAX_PACKAGES = 3;
const MAX_ADDONS = 5;
const DESC_MAX_LENGTH = 200;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function EditPricingScreen({ navigation }: Props) {
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('PER_EVENT');

  // Packages state
  const [packages, setPackages] = useState<Package[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgDuration, setPkgDuration] = useState('');

  // Add-ons state
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [showAddOnForm, setShowAddOnForm] = useState(false);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');

  // Package form helpers
  function resetPackageForm() {
    setPkgName('');
    setPkgPrice('');
    setPkgDesc('');
    setPkgDuration('');
    setEditingPackageId(null);
    setShowPackageForm(false);
  }

  function openEditPackage(pkg: Package) {
    setPkgName(pkg.name);
    setPkgPrice(pkg.price);
    setPkgDesc(pkg.description);
    setPkgDuration(pkg.duration);
    setEditingPackageId(pkg.id);
    setShowPackageForm(true);
  }

  function savePackage() {
    if (!pkgName.trim()) { Alert.alert('Required', 'Please enter a package name.'); return; }
    if (!pkgPrice.trim() || isNaN(parseFloat(pkgPrice)) || parseFloat(pkgPrice) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid price.'); return;
    }
    if (!pkgDesc.trim()) { Alert.alert('Required', 'Please enter a description.'); return; }
    if (!pkgDuration.trim() || isNaN(parseFloat(pkgDuration)) || parseFloat(pkgDuration) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid duration.'); return;
    }

    if (editingPackageId) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === editingPackageId
            ? { ...p, name: pkgName.trim(), price: pkgPrice.trim(), description: pkgDesc.trim(), duration: pkgDuration.trim() }
            : p
        )
      );
    } else {
      if (packages.length >= MAX_PACKAGES) {
        Alert.alert('Limit Reached', `You can add up to ${MAX_PACKAGES} packages.`);
        return;
      }
      setPackages((prev) => [
        ...prev,
        { id: generateId(), name: pkgName.trim(), price: pkgPrice.trim(), description: pkgDesc.trim(), duration: pkgDuration.trim() },
      ]);
    }
    resetPackageForm();
  }

  function deletePackage(id: string) {
    Alert.alert('Delete Package', 'Are you sure you want to remove this package?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setPackages((prev) => prev.filter((p) => p.id !== id)) },
    ]);
  }

  // Add-on helpers
  function resetAddOnForm() {
    setAddonName('');
    setAddonPrice('');
    setShowAddOnForm(false);
  }

  function saveAddOn() {
    if (!addonName.trim()) { Alert.alert('Required', 'Please enter an add-on name.'); return; }
    if (!addonPrice.trim() || isNaN(parseFloat(addonPrice)) || parseFloat(addonPrice) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid price.'); return;
    }
    if (addOns.length >= MAX_ADDONS) {
      Alert.alert('Limit Reached', `You can add up to ${MAX_ADDONS} add-ons.`);
      return;
    }
    setAddOns((prev) => [
      ...prev,
      { id: generateId(), name: addonName.trim(), price: addonPrice.trim() },
    ]);
    resetAddOnForm();
  }

  function deleteAddOn(id: string) {
    setAddOns((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSaveAll() {
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid base price.');
      return;
    }
    Alert.alert('Saved', 'Pricing updated!');
    navigation.goBack();
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
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
        <Text style={s.headerTitle}>Edit Pricing</Text>
        <TouchableOpacity
          onPress={handleSaveAll}
          activeOpacity={0.6}
          accessibilityLabel="Save changes"
          accessibilityRole="button"
        >
          <Text style={s.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Base price */}
          <Text style={s.sectionTitle}>Base Price</Text>
          <View style={s.priceRow}>
            <Text style={s.dollar}>$</Text>
            <TextInput
              style={s.priceInput}
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={8}
              accessibilityLabel="Price amount"
              accessibilityRole="text"
              accessibilityHint="Enter your base price in dollars"
            />
          </View>
          <View style={s.unitRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[s.unitBtn, unit === u.id && s.unitBtnActive]}
                onPress={() => setUnit(u.id)}
                activeOpacity={0.7}
                accessibilityLabel={`${u.label} pricing`}
                accessibilityRole="button"
                accessibilityState={{ selected: unit === u.id }}
              >
                <Text style={[s.unitText, unit === u.id && s.unitTextActive]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Packages section */}
          <View style={s.sectionDivider} />
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Packages</Text>
            <Text style={s.sectionCount}>{packages.length}/{MAX_PACKAGES}</Text>
          </View>

          {packages.map((pkg) => (
            <View key={pkg.id} style={s.packageCard}>
              <View style={s.packageHeader}>
                <Text style={s.packageName}>{pkg.name}</Text>
                <Text style={s.packagePrice}>${pkg.price}</Text>
              </View>
              <Text style={s.packageDesc}>{pkg.description}</Text>
              <Text style={s.packageDuration}>{pkg.duration} hour{parseFloat(pkg.duration) !== 1 ? 's' : ''}</Text>
              <View style={s.packageActions}>
                <TouchableOpacity
                  onPress={() => openEditPackage(pkg)}
                  style={s.packageActionBtn}
                  activeOpacity={0.6}
                  accessibilityLabel={`Edit ${pkg.name} package`}
                  accessibilityRole="button"
                >
                  <EditPencilIcon size={16} color={colors.text} />
                  <Text style={s.packageActionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deletePackage(pkg.id)}
                  style={s.packageActionBtn}
                  activeOpacity={0.6}
                  accessibilityLabel={`Delete ${pkg.name} package`}
                  accessibilityRole="button"
                >
                  <TrashIcon size={16} color={colors.error} />
                  <Text style={[s.packageActionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Package inline form */}
          {showPackageForm ? (
            <View style={s.formCard}>
              <View style={s.formHeader}>
                <Text style={s.formTitle}>
                  {editingPackageId ? 'Edit Package' : 'New Package'}
                </Text>
                <TouchableOpacity
                  onPress={resetPackageForm}
                  activeOpacity={0.6}
                  accessibilityLabel="Cancel package form"
                  accessibilityRole="button"
                >
                  <XIcon size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={s.fieldLabel}>Package Name</Text>
              <TextInput
                style={s.fieldInput}
                value={pkgName}
                onChangeText={setPkgName}
                placeholder="e.g., Basic, Premium, VIP"
                placeholderTextColor={colors.textMuted}
                maxLength={40}
                accessibilityLabel="Package name"
              />

              <Text style={s.fieldLabel}>Price ($)</Text>
              <TextInput
                style={s.fieldInput}
                value={pkgPrice}
                onChangeText={setPkgPrice}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                maxLength={8}
                accessibilityLabel="Package price"
              />

              <View style={s.fieldLabelRow}>
                <Text style={s.fieldLabel}>Description</Text>
                <Text style={s.charCount}>{pkgDesc.length}/{DESC_MAX_LENGTH}</Text>
              </View>
              <TextInput
                style={[s.fieldInput, s.fieldTextArea]}
                value={pkgDesc}
                onChangeText={(text) => { if (text.length <= DESC_MAX_LENGTH) setPkgDesc(text); }}
                placeholder="What's included in this package"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Package description"
              />

              <Text style={s.fieldLabel}>Duration (hours)</Text>
              <TextInput
                style={s.fieldInput}
                value={pkgDuration}
                onChangeText={setPkgDuration}
                placeholder="e.g., 2"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                maxLength={4}
                accessibilityLabel="Package duration in hours"
              />

              <TouchableOpacity
                style={s.formSaveBtn}
                onPress={savePackage}
                activeOpacity={0.7}
                accessibilityLabel="Save package"
                accessibilityRole="button"
              >
                <Text style={s.formSaveBtnText}>
                  {editingPackageId ? 'Update Package' : 'Save Package'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : packages.length < MAX_PACKAGES ? (
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => setShowPackageForm(true)}
              activeOpacity={0.7}
              accessibilityLabel="Add package"
              accessibilityRole="button"
            >
              <PlusIcon size={18} color={colors.primary} strokeWidth={2} />
              <Text style={s.addBtnText}>Add Package</Text>
            </TouchableOpacity>
          ) : null}

          {/* Add-ons section */}
          <View style={s.sectionDivider} />
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Add-ons</Text>
            <Text style={s.sectionCount}>{addOns.length}/{MAX_ADDONS}</Text>
          </View>

          {addOns.map((addon) => (
            <View key={addon.id} style={s.addonRow}>
              <View style={s.addonInfo}>
                <Text style={s.addonName}>{addon.name}</Text>
                <Text style={s.addonPrice}>+${addon.price}</Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteAddOn(addon.id)}
                style={s.addonRemoveBtn}
                activeOpacity={0.6}
                accessibilityLabel={`Remove ${addon.name} add-on`}
                accessibilityRole="button"
              >
                <XIcon size={16} color={colors.error} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add-on inline form */}
          {showAddOnForm ? (
            <View style={s.formCard}>
              <View style={s.formHeader}>
                <Text style={s.formTitle}>New Add-on</Text>
                <TouchableOpacity
                  onPress={resetAddOnForm}
                  activeOpacity={0.6}
                  accessibilityLabel="Cancel add-on form"
                  accessibilityRole="button"
                >
                  <XIcon size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={s.fieldLabel}>Name</Text>
              <TextInput
                style={s.fieldInput}
                value={addonName}
                onChangeText={setAddonName}
                placeholder="e.g., Extra hour, Setup fee"
                placeholderTextColor={colors.textMuted}
                maxLength={40}
                accessibilityLabel="Add-on name"
              />

              <Text style={s.fieldLabel}>Price ($)</Text>
              <TextInput
                style={s.fieldInput}
                value={addonPrice}
                onChangeText={setAddonPrice}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                maxLength={8}
                accessibilityLabel="Add-on price"
              />

              <TouchableOpacity
                style={s.formSaveBtn}
                onPress={saveAddOn}
                activeOpacity={0.7}
                accessibilityLabel="Save add-on"
                accessibilityRole="button"
              >
                <Text style={s.formSaveBtnText}>Save Add-on</Text>
              </TouchableOpacity>
            </View>
          ) : addOns.length < MAX_ADDONS ? (
            <TouchableOpacity
              style={s.addBtn}
              onPress={() => setShowAddOnForm(true)}
              activeOpacity={0.7}
              accessibilityLabel="Add add-on"
              accessibilityRole="button"
            >
              <PlusIcon size={18} color={colors.primary} strokeWidth={2} />
              <Text style={s.addBtnText}>Add Add-on</Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  saveText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.secondary },
  scroll: { padding: 24 },

  // Section
  sectionTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  sectionCount: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  sectionDivider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },

  // Base price
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, marginTop: 12 },
  dollar: { fontFamily: fonts.bold, fontSize: 44, color: colors.text, marginRight: 4 },
  priceInput: {
    fontFamily: fonts.bold, fontSize: 44, color: colors.text, flex: 1,
    borderBottomWidth: 2, borderBottomColor: colors.text, paddingVertical: 4,
  },
  unitRow: { flexDirection: 'row', gap: 10 },
  unitBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  unitBtnActive: { borderColor: colors.text, backgroundColor: colors.lightBlue },
  unitText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  unitTextActive: { color: colors.text, fontFamily: fonts.semiBold },

  // Package cards
  packageCard: {
    backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  packageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  packageName: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  packagePrice: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  packageDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 4 },
  packageDuration: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginBottom: 10 },
  packageActions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  packageActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  packageActionText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },

  // Inline form
  formCard: {
    backgroundColor: colors.cardBackground, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  formHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  formTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 6 },
  charCount: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  fieldInput: {
    fontFamily: fonts.regular, fontSize: 15, color: colors.text,
    backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  fieldTextArea: { minHeight: 72, paddingTop: 12 },
  formSaveBtn: {
    backgroundColor: colors.text, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', marginTop: 16,
  },
  formSaveBtnText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
    borderStyle: 'dashed', paddingVertical: 14, marginBottom: 10,
  },
  addBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },

  // Add-on rows
  addonRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.cardBackground, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  addonInfo: { flex: 1 },
  addonName: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  addonPrice: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary, marginTop: 2 },
  addonRemoveBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});
