import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { realtimeService } from "../main";
import axios from "axios";

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

//   const map = useMap();
//     useEffect(() => {
//         const control = L.Routing.control({
//             waypoints: [
//                 L.latLng(from), L.latLng(to)
//             ],
//             lineOptions: {
//                 styles: [{color: 'blue', weight: 5}]
//             },
//             addWaypoints: false,
//             draggableWaypoints: false,
//             show: false,
//             createMarker: function() { return null;},
//             router: L.Routing.osrmv1({
//                 serviceUrl: 'https://router.project-osrm.org/route/v1'

//         })
//     }).addTo(map);
//     return () => {
//         map.removeControl(control);
//     }
// },[from, to, map]);

interface RiderOrderMapProps {
  order: IOrder;
}
const RiderOrderMap = ({ order }: RiderOrderMapProps) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null,
  );

  useEffect(() => {
    const fetchRiderLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRiderLocation([latitude, longitude]);
          axios.post(
            `${realtimeService}/api/v1/internal/emit`,
            {
              event: "rider:location",
              room: `user:${order.userId}`,
              payload: {
                latitude,
                longitude,
              },
            },
            {
              headers: {
                "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY,
              },
            },
          );
        },
        (error) => console.log("Error getting location:", error),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        },
      );
    };
    fetchRiderLocation();
    const interval = setInterval(fetchRiderLocation, 10000);
    return () => clearInterval(interval);
  }, [order.userId]);

  if (
    order.deliveryAddress.latitude == null ||
    order.deliveryAddress.longitude == null
  ) {
    return <div>Invalid delivery address coordinates</div>;
  }

  const deliveryLocation: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];

  if (!riderLocation) {
    return <div>Loading map...</div>;
  }

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
          <Popup>Your Location</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>
        <RoutingMachine from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;
