import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons broken by Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createIcon = (color) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

const farmIcon = createIcon("#22c55e");     // green for farm
const customerIcon = createIcon("#3b82f6");  // blue for customer
const agentIcon = createIcon("#f59e0b");     // orange for delivery agent

// Auto-fit bounds to show all markers
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => p && p[0] !== 0 && p[1] !== 0);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView(valid[0], 14);
    } else {
      const bounds = L.latLngBounds(valid);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

const MapView = ({
  pickupCoords,   // [lat, lng] farm
  dropoffCoords,  // [lat, lng] customer
  agentCoords,    // [lat, lng] delivery agent (optional)
  height = "350px",
}) => {
  // Default center: India center
  const defaultCenter = [20.5937, 78.9629];
  const allPoints = [pickupCoords, dropoffCoords, agentCoords].filter(Boolean);
  const center = allPoints.length > 0 ? allPoints[0] : defaultCenter;

  return (
    <div style={{ height, width: "100%" }} className="rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={allPoints} />

        {pickupCoords && (
          <Marker position={pickupCoords} icon={farmIcon}>
            <Popup>
              <strong>Farm (Pickup)</strong>
              <br />
              Pickup location
            </Popup>
          </Marker>
        )}

        {dropoffCoords && (
          <Marker position={dropoffCoords} icon={customerIcon}>
            <Popup>
              <strong>Customer (Delivery)</strong>
              <br />
              Delivery address
            </Popup>
          </Marker>
        )}

        {agentCoords && (
          <Marker position={agentCoords} icon={agentIcon}>
            <Popup>
              <strong>Delivery Agent</strong>
              <br />
              Current location
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
