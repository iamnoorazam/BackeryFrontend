import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/store/Toast";
import { useCalculateDelivery, useGeocode } from "@/hooks/useDelivery";
import { Crosshair, Loader2, MapPin, Navigation, Search, AlertCircle } from "lucide-react";
import DeliveryInfo from "./DeliveryInfo";

const LocationPrompt = ({ onLocationChange, storeInfo }) => {
  const { toast } = useToast();
  const geocodeMutation = useGeocode();
  const calculateMutation = useCalculateDelivery();

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [address, setAddress] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [locationSource, setLocationSource] = useState(null);

  const hasNotified = useRef(false);

  const getLocationByGPS = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setManualMode(true);
      return;
    }

    setLocating(true);
    setGeoError(null);
    setManualMode(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCustomerLocation(loc);
        setLocationSource("gps");
        setLocating(false);
        calculateDeliveryFromCoords(loc.lat, loc.lng);
      },
      (err) => {
        setLocating(false);
        let message = "Could not detect your location.";
        if (err.code === err.PERMISSION_DENIED) {
          message = "Location access denied. Please enter your delivery address manually.";
          setManualMode(true);
        } else if (err.code === err.TIMEOUT) {
          message = "Location request timed out. Try again or enter address manually.";
        } else {
          message = "Could not detect GPS. Enter your address manually.";
        }
        setGeoError(message);
        toast({ title: message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const calculateDeliveryFromCoords = async (lat, lng) => {
    setCalculating(true);
    setCalcError(null);
    try {
      const result = await calculateMutation.mutateAsync({ lat, lng });
      setDelivery(result);
      if (onLocationChange) {
        onLocationChange({ coordinates: { lat, lng }, delivery: result });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to calculate delivery.";
      setCalcError(msg);
    } finally {
      setCalculating(false);
    }
  };

  const handleAddressSubmit = async () => {
    if (!address.trim()) {
      toast({ title: "Please enter a delivery address", variant: "destructive" });
      return;
    }
    setCalculating(true);
    setCalcError(null);
    try {
      const result = await calculateMutation.mutateAsync({ address: address.trim() });
      setCustomerLocation({ lat: result.customerLocation.lat, lng: result.customerLocation.lng, formattedAddress: address });
      setDelivery(result);
      setLocationSource("address");
      if (onLocationChange) {
        onLocationChange({
          address: address.trim(),
          coordinates: { lat: result.customerLocation.lat, lng: result.customerLocation.lng },
          delivery: result,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Invalid address. Please try again.";
      setCalcError(msg);
    } finally {
      setCalculating(false);
    }
  };

  const handleManualAddressChange = async (fullAddress) => {
    if (!fullAddress || fullAddress.length < 10) return;
    setAddress(fullAddress);
  };

  useEffect(() => {
    if (!geoError && !hasNotified.current) {
      hasNotified.current = true;
      getLocationByGPS();
    }
  }, []);

  const retryGPS = () => {
    hasNotified.current = true;
    getLocationByGPS();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-stone-900 flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 text-orange-500" /> Delivery Location
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retryGPS}
            disabled={locating || calculating}
            className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-1.5 text-xs shrink-0"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5" />
            )}
            <span className="hidden xs:inline">{locating ? "Detecting..." : "Use GPS"}</span>
          </Button>
        </div>

        {customerLocation && locationSource === "gps" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm">
            <Navigation className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-green-800">
              Location detected via GPS
            </span>
          </div>
        )}

        {manualMode && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Enter your delivery address below
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="delivery-address" className="sr-only">Delivery Address</Label>
                <Input
                  id="delivery-address"
                  value={address}
                  onChange={(e) => handleManualAddressChange(e.target.value)}
                  placeholder="Enter your full delivery address (street, area, city, pincode)"
                  className="w-full text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddressSubmit();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddressSubmit}
                disabled={calculating || !address.trim()}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                {calculating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-1.5 hidden sm:inline">Find</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeliveryInfo delivery={delivery} isLoading={calculating} error={calcError} />
    </div>
  );
};

export default LocationPrompt;
