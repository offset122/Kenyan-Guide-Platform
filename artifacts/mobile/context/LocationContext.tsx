import createContextHook from "@nkzw/create-context-hook";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { requestLocationPermission } from "@/lib/permissions";

export type LocationState = {
  coords: { latitude: number; longitude: number } | null;
  county: string | null;
  area: string | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
};

// Approximate Kenyan county by lat/lng bounding boxes
const COUNTY_BOUNDS: { county: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
  { county: "Nairobi", minLat: -1.45, maxLat: -1.15, minLng: 36.65, maxLng: 37.05 },
  { county: "Mombasa", minLat: -4.12, maxLat: -3.9, minLng: 39.55, maxLng: 39.75 },
  { county: "Kisumu", minLat: -0.2, maxLat: 0.12, minLng: 34.6, maxLng: 34.95 },
  { county: "Nakuru", minLat: -0.45, maxLat: 0.05, minLng: 35.95, maxLng: 36.35 },
  { county: "Eldoret", minLat: 0.45, maxLat: 0.65, minLng: 35.2, maxLng: 35.45 },
  { county: "Kiambu", minLat: -1.17, maxLat: -0.9, minLng: 36.7, maxLng: 37.1 },
  { county: "Machakos", minLat: -1.7, maxLat: -1.3, minLng: 37.15, maxLng: 37.55 },
  { county: "Meru", minLat: -0.1, maxLat: 0.35, minLng: 37.55, maxLng: 37.95 },
];

function getCountyFromCoords(lat: number, lng: number): string {
  const match = COUNTY_BOUNDS.find(
    (b) => lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
  );
  return match?.county ?? "Kenya";
}

const [LocationProvider, useLocation] = createContextHook(() => {
  const [state, setState] = useState<LocationState>({
    coords: null,
    county: null,
    area: null,
    loading: false,
    error: null,
    permissionGranted: false,
  });
  const [watching, setWatching] = useState(false);
  const watchSub = { current: null as Location.LocationSubscription | null };

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await requestLocationPermission({ showRationale: true });
    if (result !== "granted") {
      setState((prev) => ({ ...prev, loading: false, error: "Permission denied", permissionGranted: false }));
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const county = getCountyFromCoords(latitude, longitude);
      let area: string | null = null;
      try {
        const [geocoded] = await Location.reverseGeocodeAsync({ latitude, longitude });
        area = geocoded?.district ?? geocoded?.subregion ?? geocoded?.city ?? null;
      } catch {}
      setState({ coords: { latitude, longitude }, county, area, loading: false, error: null, permissionGranted: true });
      setWatching(true);
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Could not get location" }));
    }
  }, []);

  useEffect(() => {
    if (!watching || !state.permissionGranted) return;
    let sub: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 200, timeInterval: 30000 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const county = getCountyFromCoords(latitude, longitude);
        setState((prev) => ({ ...prev, coords: { latitude, longitude }, county }));
      }
    ).then((s) => { sub = s; watchSub.current = s; });
    return () => { sub?.remove(); };
  }, [watching, state.permissionGranted]);

  const getDistanceKm = useCallback((lat: number, lng: number): number | null => {
    if (!state.coords) return null;
    const R = 6371;
    const dLat = ((lat - state.coords.latitude) * Math.PI) / 180;
    const dLng = ((lng - state.coords.longitude) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((state.coords.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, [state.coords]);

  return { ...state, requestLocation, getDistanceKm };
});

export { LocationProvider, useLocation };
