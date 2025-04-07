"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Car, MapPin, User, LogOut, Clock, CheckCircle, AlertTriangle, DollarSign } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [activeRides, setActiveRides] = useState<any[]>([])
  const [isLive, setIsLive] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [currentRide, setCurrentRide] = useState<any>(null)
  const [reportDetails, setReportDetails] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      // Fetch user data
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          universities!inner(*),
          drivers(*),
          passengers(*)
        `)
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user data:", error)
        return
      }

      setUserData(data)

      // If user is a driver, check if they're live
      if (data.role === "driver" && data.drivers && data.drivers[0]) {
        setIsLive(data.drivers[0].is_live)

        // Fetch active rides for the driver
        const { data: ridesData, error: ridesError } = await supabase
          .from("ride_requests")
          .select(`
            *,
            passenger:passenger_id(
              id,
              first_name,
              last_name,
              email,
              whatsapp,
              gender,
              universities!inner(name)
            )
          `)
          .eq("driver_id", user.id)
          .in("status", ["accepted"])
          .order("created_at", { ascending: false })

        if (ridesError) {
          console.error("Error fetching active rides:", ridesError)
        } else {
          setActiveRides(ridesData || [])
        }
      }
    }

    fetchUserData()

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
          fetchUserData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(rideRequestsSubscription)
    }
  }, [user])

  const handleToggleLive = async () => {
    if (!user || !userData || userData.role !== "driver") return

    const newIsLive = !isLive

    try {
      const { error } = await supabase.from("drivers").update({ is_live: newIsLive }).eq("user_id", user.id)

      if (error) throw error

      setIsLive(newIsLive)

      toast({
        title: newIsLive ? "You are now live" : "You are now offline",
        description: newIsLive ? "Passengers can now see you on the map" : "You are no longer visible to passengers",
      })
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleFinishRide = (ride: any) => {
    setCurrentRide(ride)
    setShowPaymentDialog(true)
  }

  const handlePaymentConfirmation = async (received: boolean) => {
    if (!currentRide) return

    try {
      // Update ride status to completed
      const { error } = await supabase
        .from("ride_requests")
        .update({
          status: "completed",
          payment_status: received ? "paid" : "pending",
          completed_at: new Date().toISOString(),
        })
        .eq("id", currentRide.id)

      if (error) throw error

      if (received) {
        // If payment was received, just show a success message
        toast({
          title: "Ride completed",
          description: "The ride has been marked as completed and paid.",
        })
        setShowPaymentDialog(false)
      } else {
        // If payment was not received, show the report dialog
        setShowPaymentDialog(false)
        setShowReportDialog(true)
      }

      // Refresh active rides
      const { data: ridesData, error: ridesError } = await supabase
        .from("ride_requests")
        .select(`
          *,
          passenger:passenger_id(
            id,
            first_name,
            last_name,
            email,
            whatsapp,
            gender,
            universities!inner(name)
          )
        `)
        .eq("driver_id", user.id)
        .in("status", ["accepted"])
        .order("created_at", { ascending: false })

      if (ridesError) {
        console.error("Error fetching active rides:", ridesError)
      } else {
        setActiveRides(ridesData || [])
      }
    } catch (error: any) {
      toast({
        title: "Error completing ride",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmitReport = async () => {
    if (!currentRide || !user) return

    try {
      // Create a payment dispute report
      const { error } = await supabase.from("reports").insert({
        from_user_id: user.id,
        to_user_id: currentRide.passenger.id,
        ride_id: currentRide.id,
        reason: "Payment dispute",
        details: reportDetails || "Driver reported not receiving payment for the ride.",
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Report submitted",
        description: "Your payment dispute has been reported to the admin team.",
      })

      setShowReportDialog(false)
      setReportDetails("")
    } catch (error: any) {
      toast({
        title: "Error submitting report",
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
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">Dashboard</h1>
        <Button variant="ghost" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700">
                {userData.role === "driver" ? <Car className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-lg font-medium">
                  {userData.first_name} {userData.last_name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {userData.role === "driver" ? "Driver" : "Passenger"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {userData.gender === "male" ? "Male" : "Female"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t">
              <h3 className="mb-2 font-medium">Contact Information</h3>
              <p className="text-sm text-gray-600">Email: {userData.email}</p>
              <p className="text-sm text-gray-600">WhatsApp: {userData.whatsapp}</p>
            </div>

            <div className="pt-4 mt-4 border-t">
              <h3 className="mb-2 font-medium">University</h3>
              <p className="text-sm text-gray-600">{userData.universities.name}</p>
            </div>

            {userData.role === "driver" && userData.drivers && userData.drivers[0] && (
              <div className="pt-4 mt-4 border-t">
                <h3 className="mb-2 font-medium">Car Information</h3>
                <p className="text-sm text-gray-600">Plate Number: {userData.drivers[0].plate_number}</p>
                <p className="text-sm text-gray-600">Color: {userData.drivers[0].car_color}</p>
                <p className="text-sm text-gray-600">Year: {userData.drivers[0].car_year}</p>
                <p className="text-sm text-gray-600">Cylinders: {userData.drivers[0].cylinders}</p>
              </div>
            )}

            {userData.role === "passenger" && userData.passengers && userData.passengers[0] && (
              <div className="pt-4 mt-4 border-t">
                <h3 className="mb-2 font-medium">Preferences</h3>
                <p className="text-sm text-gray-600">
                  Gender Matching:{" "}
                  {userData.passengers[0].gender_preference === "same" ? "Same Gender Only" : "Any Gender"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {userData.role === "driver" ? (
          <Card>
            <CardHeader>
              <CardTitle>Driver Controls</CardTitle>
              <CardDescription>Manage your availability and rides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Go Live</h3>
                  <p className="text-sm text-gray-600">Make yourself visible to passengers</p>
                </div>
                <Switch checked={isLive} onCheckedChange={handleToggleLive} />
              </div>

              <div className="p-4 rounded-md bg-emerald-50">
                <h3 className="flex items-center gap-2 mb-2 font-medium text-emerald-700">
                  <MapPin className="w-4 h-4" />
                  Current Location
                </h3>
                <p className="text-sm text-emerald-600">
                  {userData.drivers && userData.drivers[0] && userData.drivers[0].lat && userData.drivers[0].lng
                    ? `Lat: ${userData.drivers[0].lat.toFixed(6)}, Lng: ${userData.drivers[0].lng.toFixed(6)}`
                    : "Location not set"}
                </p>
              </div>

              {activeRides.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Active Rides ({activeRides.length})
                  </h3>

                  {activeRides.map((ride) => (
                    <Card key={ride.id} className="border-blue-100">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">
                              {ride.passenger.first_name} {ride.passenger.last_name}
                            </h4>
                            <p className="text-xs text-gray-500">{ride.passenger.universities.name}</p>
                          </div>
                          <Badge className="bg-blue-50 text-blue-700">Active</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Payment Method</p>
                            <p>{ride.payment_method === "live" ? "Live Cash" : "Wish Money"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium">${ride.estimated_cost.toFixed(2)} USD</p>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleFinishRide(ride)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Finish Trip
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Link href="/map">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Ride Requests</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Find a Ride</CardTitle>
              <CardDescription>Connect with drivers going to your university</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-md bg-emerald-50">
                <h3 className="flex items-center gap-2 mb-2 font-medium text-emerald-700">
                  <MapPin className="w-4 h-4" />
                  Find Nearby Drivers
                </h3>
                <p className="text-sm text-emerald-600">View available drivers on the map and request a ride</p>
              </div>

              <Link href="/map">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Open Map</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Did you receive payment for this ride?</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Passenger:</span>
              <span>
                {currentRide?.passenger.first_name} {currentRide?.passenger.last_name}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Amount:</span>
              <span className="font-bold">${currentRide?.estimated_cost.toFixed(2)} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Payment Method:</span>
              <span>{currentRide?.payment_method === "live" ? "Live Cash" : "Wish Money"}</span>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handlePaymentConfirmation(false)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />I Didn't Get Paid
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handlePaymentConfirmation(true)}
            >
              <DollarSign className="w-4 h-4 mr-2" />I Got Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dispute Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Payment Issue</AlertDialogTitle>
            <AlertDialogDescription>
              We'll file a report about this payment issue. Please provide any additional details that might help
              resolve this situation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add any details about the payment issue..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitReport} className="bg-emerald-600 hover:bg-emerald-700">
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

