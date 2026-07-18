import { useState, useRef, useCallback, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { deliveryApi } from "@/api/delivery.api";
import { MAPS_LIBRARIES } from "@/components/organisms/checkout/checkout.constants";

/**
 * Reusable delivery-distance concern for checkout pages.
 *
 * Resolves a customer location three ways — Google Places autocomplete, browser
 * GPS, or manual-address geocoding — then fetches a cached distance/ETA/charge
 * quote from the backend (which measures from the configured store origin).
 *
 * Returns: { mapsReady, mapsAvailable, store, coords, quote, loading, locating,
 *   error, initAutocomplete, locateByGPS, geocodeManual, setLocation, reset }.
 */
const roundKey = (lat, lng) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

const parsePlace = (place) => {
  const comps = place.address_components || [];
  const get = (t) => comps.find((c) => c.types.includes(t))?.long_name || "";
  const getShort = (t) => comps.find((c) => c.types.includes(t))?.short_name || "";
  return {
    line1: `${get("street_number") ? get("street_number") + " " : ""}${get("route") || get("sublocality") || get("locality") || place.formatted_address || ""}`.trim(),
    street: get("route") || get("sublocality") || "",
    city: get("locality") || get("sublocality") || get("postal_town") || "",
    state: get("administrative_area_level_1") || "",
    pincode: get("postal_code") || "",
    country: getShort("country") || "IN",
    formattedAddress: place.formatted_address || "",
  };
};

export const useDeliveryQuote = () => {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsAvailable = mapsKey && mapsKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";
  const { isLoaded } = useLoadScript({ googleMapsApiKey: mapsKey, libraries: MAPS_LIBRARIES });
  const mapsReady = mapsAvailable && isLoaded;

  const [store, setStore] = useState(null);
  const [coords, setCoords] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const cacheRef = useRef(new Map());
  const timerRef = useRef(null);
  const acRef = useRef(null);
  const inputRef = useRef(null);
  const onPlaceRef = useRef(null);

  useEffect(() => {
    deliveryApi.getStoreInfo().then((r) => setStore(r.data.data)).catch(() => {});
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  const fetchQuote = useCallback(async (lat, lng) => {
    const key = roundKey(lat, lng);
    const cached = cacheRef.current.get(key);
    if (cached) {
      setQuote(cached);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await deliveryApi.getDistance({ lat, lng });
      cacheRef.current.set(key, res.data.data);
      setQuote(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to calculate delivery distance. Please enter a valid address.",
      );
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced: setting a location schedules a (cached) quote fetch.
  const setLocation = useCallback(
    (lat, lng) => {
      setCoords({ lat, lng });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fetchQuote(lat, lng), 400);
    },
    [fetchQuote],
  );

  // Ref callback for an address <input>: wires Google Places autocomplete.
  const initAutocomplete = useCallback(
    (el, onPlace) => {
      onPlaceRef.current = onPlace;
      if (!el || !window.google?.maps?.places) return;
      if (inputRef.current === el) return;
      inputRef.current = el;
      acRef.current = new window.google.maps.places.Autocomplete(el, {
        types: ["address"],
        componentRestrictions: { country: "in" },
        fields: ["address_components", "geometry", "formatted_address", "name"],
      });
      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        if (!place?.geometry) return;
        const parsed = parsePlace(place);
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation(lat, lng);
        onPlaceRef.current?.({ ...parsed, lat, lng });
      });
    },
    [setLocation],
  );

  const locateByGPS = useCallback(
    () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) {
          setError("GPS is not supported on this device.");
          resolve(null);
          return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocating(false);
            const { latitude, longitude } = pos.coords;
            setLocation(latitude, longitude);
            resolve({ lat: latitude, lng: longitude });
          },
          () => {
            setLocating(false);
            setError("Couldn't get your location. Please enter your address manually.");
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }),
    [setLocation],
  );

  const geocodeManual = useCallback(
    async (address) => {
      if (!address?.trim()) return null;
      setLoading(true);
      setError("");
      try {
        const res = await deliveryApi.geocodeAddress(address);
        const { lat, lng } = res.data.data;
        setLocation(lat, lng);
        return { lat, lng };
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to calculate delivery distance. Please enter a valid address.",
        );
        setLoading(false);
        return null;
      }
    },
    [setLocation],
  );

  const reset = useCallback(() => {
    setCoords(null);
    setQuote(null);
    setError("");
  }, []);

  return {
    mapsReady,
    mapsAvailable,
    store,
    coords,
    quote,
    loading,
    locating,
    error,
    initAutocomplete,
    locateByGPS,
    geocodeManual,
    setLocation,
    reset,
  };
};

export default useDeliveryQuote;
