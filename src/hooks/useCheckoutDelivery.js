import { useState, useRef, useCallback } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { deliveryApi } from "@/api/delivery.api";
import { useToast } from "@/store/Toast";
import { MAPS_LIBRARIES } from "@/components/organisms/checkout/checkout.constants";

/**
 * Encapsulates the checkout address/delivery concern: Google Places autocomplete,
 * GPS lookup, and the debounced distance/delivery-charge quote. Extracted from
 * CheckoutForm so the form itself is just the form.
 *
 * @param {(name: string, value: any) => void} setValue - react-hook-form setter,
 *   used to fill address fields when a Places suggestion is picked.
 * @returns delivery state + handlers to wire into the form:
 *   - mapsReady/mapsAvailable — whether Places autocomplete can be used
 *   - locating/distanceLoading/distanceError/delivery/coordinates — live state
 *   - initAutocomplete(el) — ref callback for the address <input>
 *   - getLocationByGPS() — "Use GPS" button handler
 *   - clearLocation() — reset coords/quote when the address is edited by hand
 */
export const useCheckoutDelivery = ({ setValue }) => {
  const { toast } = useToast();

  const [locating, setLocating] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [distanceError, setDistanceError] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);
  const distanceTimerRef = useRef(null);

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapsAvailable = mapsKey && mapsKey !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapsKey,
    libraries: MAPS_LIBRARIES,
  });
  const mapsReady = mapsAvailable && isLoaded;

  const fetchDistance = useCallback(async (lat, lng) => {
    setDistanceLoading(true);
    setDistanceError("");
    try {
      const res = await deliveryApi.getDistance({ lat, lng });
      setDelivery(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.userMessage || "Could not calculate delivery distance";
      console.error("[CheckoutForm] Distance fetch failed:", msg, err.response?.data || err.message);
      setDistanceError(msg);
    } finally {
      setDistanceLoading(false);
    }
  }, []);

  const debouncedFetchDistance = useCallback((lat, lng) => {
    if (distanceTimerRef.current) clearTimeout(distanceTimerRef.current);
    distanceTimerRef.current = setTimeout(() => fetchDistance(lat, lng), 600);
  }, [fetchDistance]);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;

    const addr = place.address_components || [];
    const get = (type) => addr.find((c) => c.types.includes(type))?.long_name || "";
    const getShort = (type) => addr.find((c) => c.types.includes(type))?.short_name || "";

    const newLine1 = `${get("street_number") ? get("street_number") + " " : ""}${get("route") || get("sublocality") || get("locality") || place.formatted_address || ""}`.trim();
    const newCity = get("locality") || get("sublocality") || get("postal_town") || "";
    const newState = get("administrative_area_level_1") || "";
    const newPostalCode = get("postal_code") || "";
    const newCountry = getShort("country") || "IN";
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setValue("line1", newLine1);
    setValue("city", newCity);
    setValue("state", newState);
    setValue("postalCode", newPostalCode);
    setValue("country", newCountry);
    setCoordinates({ lat, lng });
    debouncedFetchDistance(lat, lng);
  }, [setValue, debouncedFetchDistance]);

  const initAutocomplete = useCallback((el) => {
    if (!el || !window.google?.maps?.places) return;
    if (addressInputRef.current === el) return;
    addressInputRef.current = el;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(el, {
      types: ["address"],
      componentRestrictions: { country: "in" },
      fields: ["address_components", "geometry", "formatted_address", "name"],
    });
    autocompleteRef.current.addListener("place_changed", onPlaceChanged);
  }, [onPlaceChanged]);

  const getLocationByGPS = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoordinates({ lat, lng });
        try {
          const res = await deliveryApi.getDistance({ lat, lng });
          setDelivery(res.data.data);
        } catch (err) {
          const msg = err.response?.data?.message || err.userMessage || "Could not calculate delivery";
          console.error("[CheckoutForm] GPS distance fetch failed:", msg, err.response?.data || err.message);
          setDistanceError(msg);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast({ title: "GPS failed. Enter your address manually.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  // Called when the user edits the address by hand — the old coordinates/quote
  // no longer match, so drop them until a new place is picked.
  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setDelivery(null);
  }, []);

  return {
    mapsReady,
    mapsAvailable,
    locating,
    distanceLoading,
    distanceError,
    delivery,
    coordinates,
    initAutocomplete,
    getLocationByGPS,
    clearLocation,
  };
};

export default useCheckoutDelivery;
