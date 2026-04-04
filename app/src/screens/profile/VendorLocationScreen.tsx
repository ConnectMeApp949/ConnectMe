import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { colors, fonts, spacing, borderRadius } from '../../theme';
import { ChevronLeftIcon, SearchIcon, MapPinIcon } from '../../components/Icons';

type Props = NativeStackScreenProps<any, 'VendorLocation'>;

export default function VendorLocationScreen({ navigation }: Props) {
  const [address, setAddress] = useState('');
  const [confirmedAddress, setConfirmedAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) {
        const parts = [place.streetNumber, place.street].filter(Boolean).join(' ');
        setAddress(parts);
        setCity(place.city ?? '');
        setState(place.region ?? '');
        setConfirmedAddress([parts, place.city, place.region, place.postalCode].filter(Boolean).join(', '));
      }
    } catch {
      // Use empty state
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const results = await Location.geocodeAsync(address.trim());
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setCoords({ lat: latitude, lng: longitude });

        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          setCity(place.city ?? '');
          setState(place.region ?? '');
          setConfirmedAddress(
            [place.streetNumber, place.street, place.city, place.region, place.postalCode].filter(Boolean).join(', ')
          );
        }
      } else {
        Alert.alert('Not Found', 'Could not find that address. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not search for that address.');
    } finally {
      setSearching(false);
    }
  }

  const mapUrl = coords
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lng}&zoom=15&size=600x300&markers=color:red%7C${coords.lat},${coords.lng}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`
    : null;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.6} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeftIcon size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        <Text style={s.title}>Where is your business located?</Text>

        {/* Search bar */}
        <View style={s.searchBar}>
          <View style={s.searchIconWrap}>
            <SearchIcon size={16} color={colors.textMuted} />
          </View>
          <TextInput
            style={s.searchInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            accessibilityLabel="Address search"
            accessibilityRole="text"
            accessibilityHint="Enter your business address and press search"
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {/* Map preview or placeholder */}
        {loading ? (
          <View style={s.mapPlaceholder}>
            <ActivityIndicator color={colors.primary} />
            <Text style={s.mapPlaceholderText}>Getting your location...</Text>
          </View>
        ) : coords && mapUrl && process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <Image source={{ uri: mapUrl }} style={s.mapImage} resizeMode="cover" accessibilityLabel="Map showing your business location" accessibilityRole="image" />
        ) : (
          <View style={s.mapPlaceholder}>
            <MapPinIcon size={36} color={colors.textMuted} />
            {coords ? (
              <Text style={s.mapPlaceholderText}>Location found</Text>
            ) : (
              <Text style={s.mapPlaceholderText}>Search for your address above</Text>
            )}
          </View>
        )}

        {/* Confirmed address */}
        {confirmedAddress ? (
          <View style={s.addressCard}>
            <MapPinIcon size={20} color={colors.textSecondary} />
            <View style={s.addressInfo}>
              <Text style={s.addressMain}>{confirmedAddress}</Text>
              {city && state && <Text style={s.addressSub}>{city}, {state}</Text>}
            </View>
            <TouchableOpacity onPress={() => { setConfirmedAddress(''); setCoords(null); }} activeOpacity={0.6} accessibilityLabel="Change address" accessibilityRole="button" accessibilityHint="Clear the current address and search again">
              <Text style={s.addressChange}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, !confirmedAddress && s.nextBtnDisabled]}
          activeOpacity={0.7}
          disabled={!confirmedAddress}
          onPress={() => navigation.navigate('VendorName')}
          accessibilityLabel="Next"
          accessibilityRole="button"
          accessibilityHint="Proceed to enter your business name"
        >
          <Text style={s.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: 20, paddingVertical: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: colors.text },
  content: { flex: 1, paddingHorizontal: 24 },
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 16 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.cardBackground, borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, height: 48, marginBottom: 16,
  },
  searchIconWrap: { marginRight: 8 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text },

  mapImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  mapPlaceholder: {
    width: '100%', height: 200, borderRadius: 16, backgroundColor: colors.cardBackground,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  mapPlaceholderText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },

  addressCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  addressInfo: { flex: 1 },
  addressMain: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, lineHeight: 20 },
  addressSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  addressChange: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },

  footer: { padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border },
  nextBtn: { backgroundColor: colors.text, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
});
