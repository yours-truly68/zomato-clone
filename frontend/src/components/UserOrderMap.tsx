import { useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

interface UserOrderMapProps {
  riderLocation: [number, number];
  deliveryLocation: [number, number];
}

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options: any): any;
  }
}

const riderICon = new L.DivIcon({
  html: "🛵",
  iconSize: [64, 64],
  className: "",
});
const deliveryIcon = new L.DivIcon({
  html: "📍",
  iconSize: [64, 64],
  className: "",
});

const RoutingMachine = ({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      lineOptions: {
        styles: [{ color: "#3273dc", weight: 5 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: function () {
        return null;
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);
    return () => {
      map.removeControl(control);
    };
  }, [from, to, map]);

  return null;
};

const UserOrderMap = ({
  riderLocation,
  deliveryLocation,
}: UserOrderMapProps) => {
  return (
    <div className="rounded-xl p-3 bg-white shadow-sm">
      <MapContainer
        center={riderLocation}
        zoom={14}
        className="h-87.5 w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={riderLocation} icon={riderICon}>
          <Popup>Rider Location</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>
        <RoutingMachine from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default UserOrderMap;
