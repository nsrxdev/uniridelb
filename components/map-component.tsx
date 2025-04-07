"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix the marker icon issue
const fixLeafletIcon = () => {
  // Only run on client
  if (typeof window !== "undefined") {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl
    // @ts-ignore
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    })
  }
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  car_brand: string
  car_model: string
  car_color: string
  lat: number
  lng: number
}

interface MapComponentProps {
  center: [number, number]
  userLocation: [number, number] | null
  drivers: Driver[]
  onDriverSelect: (driverId: string) => void
}

export default function MapComponent({ center, userLocation, drivers, onDriverSelect }: MapComponentProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {/* Driver markers */}
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.lat, driver.lng]}
          eventHandlers={{
            click: () => onDriverSelect(driver.id),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-medium">
                {driver.first_name} {driver.last_name.charAt(0)}.
              </p>
              <p>
                {driver.car_brand} {driver.car_model}, {driver.car_color}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

