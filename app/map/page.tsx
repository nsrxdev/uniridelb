"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Car, MapPin, DollarSign, ArrowLeft } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

// Import leaflet CSS only on client side
import "leaflet/dist/leaflet.css"

// Dynamically import Leaflet with no SSR
const MapWithNoSSR = dynamic(() => import("@/components/map-component"), { ssr: false })

interface Driver {
  id: string
  first_name: string
  last_name: string
  gender: string
  university: string
  car_brand: string
  car_model: string
  car_year: number
  car_color: string
  plate_number: string
  lat: number
  lng: number
}

interface RideRequest {
  id: string
  driver: Driver
  status: string
  estimated_cost: number
  payment_method: string
  created_at: string
}

export default function MapPage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("live")
  const [requestSent, setRequestSent] = useState(false)
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([33.8938, 35.5018]) // Beirut
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          setMapCenter([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  // Fetch user data and active drivers
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(`
          *,
          universities!inner(*),
          drivers(*),
          passengers(*)
        `)
        .eq("id", user.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        return
      }

      setUserData(userData)

      // Fetch active drivers
      const { data: driversData, error: driversError } = await supabase
        .from("active_drivers")
        .select("*")
        .eq("is_live", true)

      if (driversError) {
        console.error("Error fetching drivers:", driversError)
        return
      }

      // Filter drivers based on user preferences if user is a passenger
      let filteredDrivers = driversData

      if (userData.role === "passenger" && userData.passengers && userData.passengers[0]) {
        // Filter by gender if user prefers same gender only
        if (userData.passengers[0].gender_preference === "same") {
          filteredDrivers = driversData.filter((driver) => driver.gender === userData.gender)
        }

        // Filter by university
        filteredDrivers = filteredDrivers.filter((driver) => driver.university === userData.universities.name)
      }

      setDrivers(filteredDrivers)

      // Fetch ride requests
      if (userData.role === "passenger") {
        const { data: requestsData, error: requestsError } = await supabase
          .from("ride_requests")
          .select(`
            *,
            driver:driver_id(
              id,
              first_name,
              last_name,
              gender,
              universities!inner(name),
              drivers!inner(
                car_model_id(brand, model),
                car_year,
                car_color,
                plate_number,
                lat,
                lng
              )
            )
          `)
          .eq("passenger_id", user.id)
          .order("created_at", { ascending: false })

        if (requestsError) {
          console.error("Error fetching ride requests:", requestsError)
        } else {
          setRideRequests(requestsData)
        }
      } else if (userData.role === "driver") {
        const { data: requestsData, error: requestsError } = await supabase
          .from("ride_requests")
          .select(`
            *,
            passenger:passenger_id(
              id,
              first_name,
              last_name,
              gender,
              universities!inner(name),
              whatsapp
            )
          `)
          .eq("driver_id", user.id)
          .order("created_at", { ascending: false })

        if (requestsError) {
          console.error("Error fetching ride requests:", requestsError)
        } else {
          setRideRequests(requestsData)
        }
      }
    }

    fetchData()

    // Set up real-time subscription for ride requests
    const rideRequestsSubscription = supabase
      .channel("ride_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ride_requests",
          filter: user?.id ? `driver_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          console.log("Ride request change:", payload)
          // Refresh data when a change occurs
          fetchData()
        },
      )
      .subscribe()

    // Set up real-time subscription for driver status changes
    const driversSubscription = supabase
      .channel("drivers_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
          filter: "is_live=eq.true",
        },
        (payload) => {
          console.log("Driver change:", payload)
          // Refresh data when a change occurs
          fetchData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(rideRequestsSubscription)
      supabase.removeChannel(driversSubscription)
    }
  }, [user, router])

  const handleDriverSelect = async (driverId: string) => {
    setSelectedDriver(driverId)
    setRequestSent(false)

    // Calculate estimated cost
    const selectedDriver = drivers.find((d) => d.id === driverId)

    if (selectedDriver && userLocation && userData) {
      try {
        const { data, error } = await supabase.rpc("calculate_trip_cost", {
          driver_id: driverId,
          destination_lat: userData.universities.lat,
          destination_lng: userData.universities.lng,
        })

        if (error) throw error

        if (data && data.length > 0) {
          setEstimatedCost(data[0].passenger_cost_usd)
        }
      } catch (error: any) {
        toast({
          title: "Error calculating cost",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleSendRequest = async () => {
    if (!user || !selectedDriver || !userLocation) return

    try {
      const { error } = await supabase.from("ride_requests").insert({
        driver_id: selectedDriver,
        passenger_id: user.id,
        status: "requested",
        pickup_lat: userLocation[0],
        pickup_lng: userLocation[1],
        estimated_cost: estimatedCost,
        payment_method: paymentMethod,
        payment_status: "pending",
      })

      if (error) throw error

      setRequestSent(true)

      toast({
        title: "Ride request sent",
        description: "The driver will be notified of your request",
      })
    } catch (error: any) {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRequestAction = async (requestId: string, action: "accept" | "decline") => {
    try {
      const { error } = await supabase
        .from("ride_requests")
        .update({ status: action === "accept" ? "accepted" : "declined" })
        .eq("id", requestId)

      if (error) throw error

      toast({
        title: action === "accept" ? "Request accepted" : "Request declined",
        description:
          action === "accept" ? "The passenger will be notified" : "The passenger will be notified that you declined",
      })
    } catch (error: any) {
      toast({
        title: "Error updating request",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!userData) {
    return (
      <div className="container flex items-center justify-center min-h-screen px-4 py-8 mx-auto">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-emerald-700">
            {userData.role === "driver" ? "Ride Requests" : "Find a Ride"}
          </h1>
        </div>
        <Badge variant="outline" className="bg-emerald-50">
          {userData.role === "driver" ? "Driver Mode" : "Passenger Mode"}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Map area */}
        <div className="relative flex-grow h-[50vh] md:h-auto">
          <MapWithNoSSR
            center={mapCenter}
            userLocation={userLocation}
            drivers={userData.role === "passenger" ? drivers : []}
            onDriverSelect={handleDriverSelect}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 border-l">
          <Tabs defaultValue={userData.role === "driver" ? "requests" : "drivers"}>
            <TabsList className="w-full">
              {userData.role === "passenger" && (
                <TabsTrigger value="drivers" className="flex-1">
                  Available Drivers
                </TabsTrigger>
              )}
              <TabsTrigger value="requests" className="flex-1">
                {userData.role === "driver" ? "Ride Requests" : "My Requests"}
              </TabsTrigger>
            </TabsList>

            {userData.role === "passenger" && (
              <TabsContent value="drivers" className="p-0">
                <div className="divide-y">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div
                        key={driver.id}
                        className={`p-4 cursor-pointer ${selectedDriver === driver.id ? "bg-emerald-50" : ""}`}
                        onClick={() => handleDriverSelect(driver.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {driver.first_name.charAt(0)}
                              {driver.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {driver.first_name} {driver.last_name.charAt(0)}.
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Car className="w-3 h-3" />
                              <span>
                                {driver.car_brand} {driver.car_model}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                          <span>{driver.university}</span>
                          <span>
                            {userLocation
                              ? `${(
                                  Math.round(
                                    Math.sqrt(
                                      Math.pow((driver.lat - userLocation[0]) * 111, 2) +
                                        Math.pow((driver.lng - userLocation[1]) * 111, 2),
                                    ) * 10,
                                  ) / 10
                                ).toFixed(1)} km`
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>No drivers available at the moment</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            <TabsContent value="requests" className="p-4">
              {rideRequests.length > 0 ? (
                <div className="space-y-4">
                  {rideRequests.map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                {userData.role === "driver"
                                  ? `${request.passenger.first_name.charAt(0)}${request.passenger.last_name.charAt(0)}`
                                  : `${request.driver.first_name.charAt(0)}${request.driver.last_name.charAt(0)}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {userData.role === "driver"
                                  ? `${request.passenger.first_name} ${request.passenger.last_name.charAt(0)}.`
                                  : `${request.driver.first_name} ${request.driver.last_name.charAt(0)}.`}
                              </h3>
                              {userData.role === "passenger" && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Car className="w-3 h-3" />
                                  <span>
                                    {request.driver.drivers[0].car_model.brand}{" "}
                                    {request.driver.drivers[0].car_model.model}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              request.status === "requested"
                                ? "outline"
                                : request.status === "accepted"
                                  ? "default"
                                  : request.status === "completed"
                                    ? "success"
                                    : "destructive"
                            }
                            className={
                              request.status === "requested"
                                ? "bg-yellow-50 text-yellow-700"
                                : request.status === "accepted"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : request.status === "completed"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-red-50 text-red-700"
                            }
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-3 mb-3 text-sm rounded-md bg-gray-50">
                          <div>
                            <p className="text-gray-500">Payment</p>
                            <p>{request.payment_method === "live" ? "Live Cash" : "Wish Money"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cost</p>
                            <p>${request.estimated_cost?.toFixed(2)} USD</p>
                          </div>
                        </div>

                        {userData.role === "driver" && request.status === "requested" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => handleRequestAction(request.id, "decline")}
                            >
                              Decline
                            </Button>
                            <Button
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleRequestAction(request.id, "accept")}
                            >
                              Accept
                            </Button>
                          </div>
                        )}

                        {userData.role === "passenger" && request.status === "accepted" && (
                          <div className="p-3 text-sm rounded-md bg-emerald-50 text-emerald-700">
                            <p className="font-medium">Contact Driver</p>
                            <p className="mt-1">WhatsApp: {request.driver.whatsapp}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No active requests</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {userData.role === "passenger" && selectedDriver && (
            <Card className="m-4">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Ride Details</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">
                      Distance:{" "}
                      {userLocation && drivers.find((d) => d.id === selectedDriver)
                        ? `${(
                            Math.round(
                              Math.sqrt(
                                Math.pow(
                                  (drivers.find((d) => d.id === selectedDriver)!.lat - userLocation[0]) * 111,
                                  2,
                                ) +
                                  Math.pow(
                                    (drivers.find((d) => d.id === selectedDriver)!.lng - userLocation[1]) * 111,
                                    2,
                                  ),
                              ) * 10,
                            ) / 10
                          ).toFixed(1)} km`
                        : "Calculating..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm">
                      Estimated cost: {estimatedCost ? `$${estimatedCost.toFixed(2)} USD` : "Calculating..."}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Payment Method</h4>
                  <RadioGroup defaultValue="live" value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live" id="live" />
                      <Label htmlFor="live">Live Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wish" id="wish" />
                      <Label htmlFor="wish">Wish Money</Label>
                    </div>
                  </RadioGroup>
                </div>

                {requestSent ? (
                  <div className="p-3 text-sm rounded-md bg-emerald-50 text-emerald-700">
                    Request sent! Waiting for driver to accept.
                  </div>
                ) : (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSendRequest}>
                    Send Ride Request
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

