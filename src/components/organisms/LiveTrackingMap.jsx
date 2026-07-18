import { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import { Loader2, Bike } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";

const containerStyle = { width: "100%", height: "260px", borderRadius: "0.75rem" };
// Must match the libraries other GoogleMap loaders use (DeliveryMap) — the
// script is loaded once globally and re-loading with different options errors.
const MAP_LIBRARIES = ["places"];

const ICON = {
  pickup: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  drop: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  rider: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
};

/**
 * Customer live-tracking map (Phase 4, D5). Plots the pickup (store), the drop
 * (customer) and the rider's live position, and draws the rider→drop route. The
 * rider marker starts from the tracking snapshot and is kept live by the socket
 * "rider_location" event for this order.
 */
const LiveTrackingMap = ({ orderId, pickup, drop, initialRider }) => {
  const { user } = useAuth();
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey || "",
    libraries: MAP_LIBRARIES,
  });

  const [rider, setRider] = useState(initialRider || null);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  // Keep the rider marker in sync as new positions arrive from the server.
  useEffect(() => {
    if (initialRider) setRider(initialRider);
  }, [initialRider]);

  useEffect(() => {
    if (!user?.id) return;
    connectSocket(user.id);
    const s = getSocket();
    const onMove = (payload) => {
      if (payload?.orderId?.toString() === orderId?.toString()) {
        setRider({ lat: payload.lat, lng: payload.lng });
      }
    };
    s.on("rider_location", onMove);
    return () => {
      s.off("rider_location", onMove);
      disconnectSocket();
    };
  }, [user?.id, orderId]);

  // Draw the route from the rider (or pickup) to the drop.
  useEffect(() => {
    if (!isLoaded || !drop || !window.google?.maps?.DirectionsService) return;
    const origin = rider || pickup;
    if (!origin) return;
    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: drop.lat, lng: drop.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) setDirections(res);
      },
    );
  }, [isLoaded, rider, pickup, drop]);

  const onLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (!window.google?.maps) return;
      const bounds = new window.google.maps.LatLngBounds();
      [pickup, drop, rider].forEach((p) => p && bounds.extend({ lat: p.lat, lng: p.lng }));
      if (!bounds.isEmpty()) map.fitBounds(bounds);
    },
    [pickup, drop, rider],
  );

  // Graceful fallback when Maps isn't configured/available — still useful text.
  if (!mapsKey || loadError) {
    return (
      <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm text-stone-600 space-y-1">
        <p className="flex items-center gap-1.5 font-semibold">
          <Bike className="h-4 w-4 text-emerald-600" /> Rider en route
        </p>
        {rider ? (
          <p className="text-xs text-stone-500">
            Live position: {rider.lat.toFixed(4)}, {rider.lng.toFixed(4)}
          </p>
        ) : (
          <p className="text-xs text-stone-500">Waiting for the rider&apos;s location…</p>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-center"
        style={{ height: "260px" }}
      >
        <Loader2 className="h-6 w-6 text-stone-400 animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={rider || pickup || drop || { lat: 25.749, lng: 84.4414 }}
      zoom={13}
      onLoad={onLoad}
      options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}
    >
      {pickup && <Marker position={pickup} icon={{ url: ICON.pickup }} title="Pickup" />}
      {drop && <Marker position={drop} icon={{ url: ICON.drop }} title="Delivery address" />}
      {rider && <Marker position={rider} icon={{ url: ICON.rider }} title="Delivery partner" />}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#0F766E", strokeWeight: 4, strokeOpacity: 0.85 },
          }}
        />
      )}
    </GoogleMap>
  );
};

export default LiveTrackingMap;
