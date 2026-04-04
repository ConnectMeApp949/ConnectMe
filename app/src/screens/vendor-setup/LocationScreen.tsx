import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileSetupLayout from '../../components/ProfileSetupLayout';
import TextInput from '../../components/TextInput';
import { VendorSetupParamList } from './types';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

type Props = NativeStackScreenProps<VendorSetupParamList, 'Location'>;

export default function LocationScreen({ navigation, route }: Props) {
  const draft = route.params.draft;
  const [city, setCity] = useState(draft.city ?? '');
  const [state, setState] = useState(draft.state ?? '');
  const [radius, setRadius] = useState(draft.serviceRadius ?? 25);

  const isValid = city.trim().length > 0 && state.trim().length > 0;
  const mapUrl = city && state && GOOGLE_MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(`${city}, ${state}`)}&zoom=10&size=400x200&key=${GOOGLE_MAPS_KEY}`
    : null;

  return (
    <ProfileSetupLayout
      step={5}
      totalSteps={7}
      title="Where are you based?"
      subtitle="Clients search by location. Set your service area."
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate('Photos', {
          draft: { ...draft, city: city.trim(), state: state.trim(), serviceRadius: radius },
        })
      }
      continueDisabled={!isValid}
    >
      <View style={styles.row}>
        <View style={styles.cityField}>
          <TextInput
            label="City"
            placeholder="San Antonio"
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={styles.stateField}>
          <TextInput
            label="State"
            placeholder="TX"
            value={state}
            onChangeText={setState}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <Text style={styles.sliderLabel}>Service radius</Text>
      <Slider
        style={styles.slider}
        minimumValue={5}
        maximumValue={100}
        step={5}
        value={radius}
        onValueChange={setRadius}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
      <Text style={styles.radiusValue}>{radius} miles</Text>

      {/* Static map preview */}
      {mapUrl ? (
        <Image source={{ uri: mapUrl }} style={styles.map} resizeMode="cover" />
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            Map preview will appear when city and state are entered
          </Text>
        </View>
      )}
    </ProfileSetupLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cityField: {
    flex: 2,
  },
  stateField: {
    flex: 1,
  },
  sliderLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
  },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  mapPlaceholderText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
