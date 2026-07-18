import { useCallback } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Store, MapPin, Navigation, Bike, AlertTriangle } from "lucide-react";

/**
 * Live delivery-distance panel: store → customer distance, ETA and a small route
 * map. Purely presentational — feed it the state from useDeliveryQuote.
 */
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  clickableIcons: false,
  gestureHandling: "cooperative",
  styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
};

const Row = ({ icon: Icon, label, value, valueClass = "text-foreground" }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-semibold">{label}</p>
      <p className={`text-sm font-medium leading-snug ${valueClass} break-words`}>{value}</p>
    </div>
  </div>
);

const DeliveryQuote = ({ mapsReady, store, coords, quote, loading, error, customerAddress, deliverable = true }) => {
  const onMapLoad = useCallback(
    (map) => {
      if (!store || !coords || !window.google) return;
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: store.lat, lng: store.lng });
      bounds.extend({ lat: coords.lat, lng: coords.lng });
      map.fitBounds(bounds, 48);
    },
    [store, coords],
  );

  const showMap = mapsReady && store && coords && quote;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
      <div className="px-4 sm:px-5 py-3 border-b border-border flex items-center gap-2">
        <Navigation className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm sm:text-base">Delivery distance</h3>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 text-sm text-muted-foreground py-4"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Calculating delivery distance…
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 rounded-xl bg-danger-subtle text-danger p-3 text-sm"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
            </motion.div>
          ) : quote ? (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3.5"
            >
              <Row icon={Store} label="Store" value={store?.name || store?.address || "Main Store"} />
              <Row icon={MapPin} label="Delivery Address" value={customerAddress || "Your location"} />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <motion.div
                  key={`dist-${quote.distanceKm}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl bg-muted p-3 text-center"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-semibold flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" /> Distance
                  </p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{quote.distanceKm} km</p>
                </motion.div>
                <motion.div
                  key={`eta-${quote.durationMinutes}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl bg-muted p-3 text-center"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-semibold flex items-center justify-center gap-1">
                    <Bike className="h-3 w-3" /> ETA
                  </p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {quote.durationText || `${quote.durationMinutes} min`}
                  </p>
                </motion.div>
              </div>

              {!deliverable && (
                <div className="flex items-start gap-2.5 rounded-xl bg-danger-subtle text-danger p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  Currently unavailable for delivery to this location (beyond our delivery range).
                </div>
              )}

              {showMap && (
                <div className="rounded-xl overflow-hidden border border-border">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "160px" }}
                    onLoad={onMapLoad}
                    options={mapOptions}
                    center={{ lat: coords.lat, lng: coords.lng }}
                    zoom={13}
                  >
                    <Marker position={{ lat: store.lat, lng: store.lng }} label={{ text: "🏪", fontSize: "18px" }} />
                    <Marker position={{ lat: coords.lat, lng: coords.lng }} label={{ text: "📍", fontSize: "18px" }} />
                    <Polyline
                      path={[
                        { lat: store.lat, lng: store.lng },
                        { lat: coords.lat, lng: coords.lng },
                      ]}
                      options={{ strokeColor: "#D2691E", strokeWeight: 3, strokeOpacity: 0.85 }}
                    />
                  </GoogleMap>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground py-2"
            >
              Enter or select your delivery address to see distance, ETA and delivery charge.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryQuote;
