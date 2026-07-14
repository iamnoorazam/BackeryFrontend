import { useState, useEffect, useMemo, useCallback } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript, InfoWindow } from "@react-google-maps/api";
import { Loader2, MapPin, Store } from "lucide-react";

const containerStyle = { width: "100%", height: "280px", borderRadius: "0.75rem" };
const libraries = ["places"];

const defaultCenter = { lat: 25.749, lng: 84.4414 };

const DeliveryMap = ({ storeLocation, customerLocation }) => {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey,
    libraries,
  });

  const [directions, setDirections] = useState(null);
  const [showStoreInfo, setShowStoreInfo] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);

  const center = useMemo(() => {
    if (storeLocation && customerLocation) {
      return {
        lat: (storeLocation.lat + customerLocation.lat) / 2,
        lng: (storeLocation.lng + customerLocation.lng) / 2,
      };
    }
    return defaultCenter;
  }, [storeLocation, customerLocation]);

  useEffect(() => {
    if (!isLoaded || !storeLocation || !customerLocation) return;
    setDirections(null);

    if (!window.google?.maps?.DirectionsService) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: storeLocation.lat, lng: storeLocation.lng },
        destination: { lat: customerLocation.lat, lng: customerLocation.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, storeLocation, customerLocation]);

  const onLoad = useCallback(
    (map) => {
      if (storeLocation && customerLocation && window.google?.maps) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: storeLocation.lat, lng: storeLocation.lng });
        bounds.extend({ lat: customerLocation.lat, lng: customerLocation.lng });
        map.fitBounds(bounds);
      }
    },
    [storeLocation, customerLocation]
  );

  if (loadError) {
    return (
      <div className="bg-stone-100 border border-stone-200 rounded-xl p-6 text-center">
        <MapPin className="h-8 w-8 text-stone-400 mx-auto mb-2" />
        <p className="text-sm text-stone-500">Map could not be loaded</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-center" style={{ height: "280px" }}>
        <Loader2 className="h-6 w-6 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={onLoad}
      options={{
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {storeLocation && (
        <Marker
          position={{ lat: storeLocation.lat, lng: storeLocation.lng }}
          icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", scaledSize: { width: 36, height: 36 } }}
          onClick={() => setShowStoreInfo((v) => !v)}
        />
      )}
      {showStoreInfo && storeLocation && (
        <InfoWindow
          position={{ lat: storeLocation.lat, lng: storeLocation.lng }}
          onCloseClick={() => setShowStoreInfo(false)}
        >
          <div className="text-xs">
            <p className="font-semibold flex items-center gap-1"><Store className="h-3 w-3" /> Our Bakery</p>
            <p className="text-stone-500 mt-0.5">{storeLocation.address || "Main Office"}</p>
          </div>
        </InfoWindow>
      )}

      {customerLocation && (
        <Marker
          position={{ lat: customerLocation.lat, lng: customerLocation.lng }}
          icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", scaledSize: { width: 36, height: 36 } }}
          onClick={() => setShowCustomerInfo((v) => !v)}
        />
      )}
      {showCustomerInfo && customerLocation && (
        <InfoWindow
          position={{ lat: customerLocation.lat, lng: customerLocation.lng }}
          onCloseClick={() => setShowCustomerInfo(false)}
        >
          <div className="text-xs">
            <p className="font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" /> Your Location</p>
            <p className="text-stone-500 mt-0.5">
              {customerLocation.formattedAddress || `${customerLocation.lat?.toFixed(4)}, ${customerLocation.lng?.toFixed(4)}`}
            </p>
          </div>
        </InfoWindow>
      )}

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#f97316", strokeWeight: 4, strokeOpacity: 0.8 },
          }}
        />
      )}
    </GoogleMap>
  );
};

export default DeliveryMap;
