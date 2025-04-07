"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  LogOut,
  Check,
  X,
  Ban,
  AlertTriangle,
  DollarSign,
  Car,
  User,
  RefreshCw,
  ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"
import Image from "next/image"
import { getServiceSupabase } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([])
  const [pendingPassengers, setPendingPassengers] = useState<any[]>([])
  const [switchRequests, setSwitchRequests] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [ongoingRides, setOngoingRides] = useState<any[]>([])
  const [completedRides, setCompletedRides] = useState<any[]>([])
  const [fuelPrice, setFuelPrice] = useState<string>("")
  const [currentFuelPrice, setCurrentFuelPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>("")
  const [rideHistoryFilter, setRideHistoryFilter] = useState<string>("all")
  const [viewingUser, setViewingUser] = useState<any>(null)
  const [showUserDocumentsDialog, setShowUserDocumentsDialog] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)

    try {
      // Use the service role key for admin operations
      const adminSupabase = getServiceSupabase()

      // Fetch pending drivers
      const { data: driversData, error: driversError } = await adminSupabase
        .from("users")
        .select(`
      *,
      universities!inner(*),
      drivers(*)
    `)
        .eq("status", "pending")
        .eq("role", "driver")
        .order("created_at", { ascending: false })

      if (driversError) throw driversError
      setPendingDrivers(driversData || [])

      // Fetch pending passengers
      const { data: passengersData, error: passengersError } = await adminSupabase
        .from("users")
        .select(`
      *,
      universities!inner(*),
      passengers(*)
    `)
        .eq("status", "pending")
        .eq("role", "passenger")
        .order("created_at", { ascending: false })

      if (passengersError) throw passengersError
      setPendingPassengers(passengersData || [])

      // Fetch switch requests
      const { data: switchData, error: switchError } = await adminSupabase
        .from("users")
        .select(`
      *,
      universities!inner(name)
    `)
        .eq("switch_request", true)
        .order("created_at", { ascending: false })

      if (switchError) throw switchError
      setSwitchRequests(switchData || [])

      // Fetch reports
      const { data: reportsData, error: reportsError } = await adminSupabase
        .from("reports")
        .select(`
      *,
      from_user:from_user_id(id, first_name, last_name, email),
      to_user:to_user_id(id, first_name, last_name, email),
      ride:ride_id(id, created_at)
    `)
        .order("created_at", { ascending: false })

      if (reportsError) throw reportsError
      setReports(reportsData || [])

      // Fetch ongoing rides
      const { data: ongoingRidesData, error: ongoingRidesError } = await adminSupabase
        .from("ride_requests")
        .select(`
        *,
        driver:driver_id(
          id, 
          first_name, 
          last_name, 
          email,
          whatsapp,
          gender,
          universities!inner(name),
          drivers!inner(
            car_model_id(brand, model),
            car_year,
            car_color,
            plate_number
          )
        ),
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
        .in("status", ["requested", "accepted"])
        .order("created_at", { ascending: false })

      if (ongoingRidesError) throw ongoingRidesError
      setOngoingRides(ongoingRidesData || [])

      // Fetch completed rides
      const { data: completedRidesData, error: completedRidesError } = await adminSupabase
        .from("ride_requests")
        .select(`
        *,
        driver:driver_id(
          id, 
          first_name, 
          last_name, 
          email,
          whatsapp,
          gender,
          universities!inner(name),
          drivers!inner(
            car_model_id(brand, model),
            car_year,
            car_color,
            plate_number
          )
        ),
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
        .in("status", ["completed", "declined", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(100) // Limit to the last 100 completed rides

      if (completedRidesError) throw completedRidesError
      setCompletedRides(completedRidesData || [])

      // Fetch current fuel price
      const { data: fuelData, error: fuelError } = await adminSupabase
        .from("fuel_prices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)

      if (fuelError) throw fuelError
      if (fuelData && fuelData.length > 0) {
        setCurrentFuelPrice(fuelData[0].price_usd)
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApproveUser = async (userId: string) => {
    try {
      const adminSupabase = getServiceSupabase()
      const { error } = await adminSupabase.rpc("approve_user", { user_id: userId })

      if (error) throw error

      toast({
        title: "User approved",
        description: "The user has been approved successfully",
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error approving user",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      const adminSupabase = getServiceSupabase()
      const { error } = await adminSupabase.from("users").update({ status: "rejected" }).eq("id", userId)

      if (error) throw error

      toast({
        title: "User rejected",
        description: "The user has been rejected successfully",
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error rejecting user",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const adminSupabase = getServiceSupabase()
      const { error } = await adminSupabase.rpc("ban_user", { user_id: userId })

      if (error) throw error

      toast({
        title: "User banned",
        description: "The user has been banned successfully",
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error banning user",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleApproveSwitch = async (userId: string) => {
    try {
      const adminSupabase = getServiceSupabase()
      // First, update the user's role to driver
      const { error: updateError } = await adminSupabase
        .from("users")
        .update({
          role: "driver",
          switch_request: false,
        })
        .eq("id", userId)

      if (updateError) throw updateError

      toast({
        title: "Role switch approved",
        description: "The user is now a driver",
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error approving switch",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRejectSwitch = async (userId: string) => {
    try {
      const adminSupabase = getServiceSupabase()
      const { error } = await adminSupabase.from("users").update({ switch_request: false }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Role switch rejected",
        description: "The user remains a passenger",
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error rejecting switch",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateFuelPrice = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const price = Number.parseFloat(fuelPrice)

      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid fuel price")
      }

      const adminSupabase = getServiceSupabase()
      const { error } = await adminSupabase.from("fuel_prices").insert({ price_usd: price })

      if (error) throw error

      setCurrentFuelPrice(price)
      setFuelPrice("")

      toast({
        title: "Fuel price updated",
        description: `New fuel price: $${price.toFixed(2)} USD/L`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating fuel price",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdatePaymentStatus = async (rideId: string, status: string) => {
    try {
      const adminSupabase = getServiceSupabase()
      const { error } = await adminSupabase.from("ride_requests").update({ payment_status: status }).eq("id", rideId)

      if (error) throw error

      toast({
        title: "Payment status updated",
        description: `Payment status updated to ${status}`,
      })

      // Refresh data
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error updating payment status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSignOut = () => {
    try {
      // Clear admin authentication from localStorage
      localStorage.removeItem("adminAuthenticated")

      // Redirect to login page
      window.location.href = "/admin-secret-2025/login"
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const countReportsForUser = (userId: string) => {
    return reports.filter((report) => report.to_user.id === userId).length
  }

  const getFilteredRides = () => {
    const allRides = [...ongoingRides, ...completedRides]

    if (rideHistoryFilter === "all") {
      return allRides
    } else if (rideHistoryFilter === "ongoing") {
      return ongoingRides
    } else if (rideHistoryFilter === "completed") {
      return completedRides
    } else if (rideHistoryFilter === "paid") {
      return allRides.filter((ride) => ride.payment_status === "paid")
    } else if (rideHistoryFilter === "pending") {
      return allRides.filter((ride) => ride.payment_status === "pending")
    }

    return allRides
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-50 text-yellow-700"
      case "accepted":
        return "bg-blue-50 text-blue-700"
      case "completed":
        return "bg-emerald-50 text-emerald-700"
      case "declined":
      case "cancelled":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700"
      case "pending":
        return "bg-yellow-50 text-yellow-700"
      case "failed":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const handleViewUserDocuments = async (user: any) => {
    setViewingUser(user)
    setShowUserDocumentsDialog(true)
  }

  const handleViewImage = (url: string, title: string) => {
    setSelectedImage(url)
    setSelectedImageTitle(title)
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen px-4 py-8 mx-auto">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">UniRide LB Admin Dashboard</h1>
          <p className="text-gray-500">Manage users, reports, and system settings</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="drivers" className="flex items-center gap-2 py-3">
            <Car className="w-4 h-4" />
            <span className="hidden md:inline">Pending</span> Drivers
            {pendingDrivers.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700">
                {pendingDrivers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="passengers" className="flex items-center gap-2 py-3">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Pending</span> Passengers
            {pendingPassengers.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700">
                {pendingPassengers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="switches" className="flex items-center gap-2 py-3">
            <RefreshCw className="w-4 h-4" />
            Role Switches
            {switchRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700">
                {switchRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rides" className="flex items-center gap-2 py-3">
            <Clock className="w-4 h-4" />
            Ride History
            {ongoingRides.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                {ongoingRides.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex items-center gap-2 py-3">
            <DollarSign className="w-4 h-4" />
            Fuel Price
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 py-3">
            <AlertTriangle className="w-4 h-4" />
            Reports
            {reports.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Drivers Tab */}
        <TabsContent value="drivers">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingDrivers.length > 0 ? (
              pendingDrivers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        Driver
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p>{user.whatsapp}</p>
                      </div>
                      <div>
                        <p className="font-medium">University</p>
                        <p>{user.universities.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Gender</p>
                        <p>{user.gender}</p>
                      </div>
                      <div>
                        <p className="font-medium">Registered</p>
                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {user.drivers && user.drivers[0] && (
                      <div className="p-3 space-y-3 border rounded-md">
                        <h4 className="font-medium">Car Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium">Plate Number</p>
                            <p>{user.drivers[0].plate_number}</p>
                          </div>
                          <div>
                            <p className="font-medium">Car Year</p>
                            <p>{user.drivers[0].car_year}</p>
                          </div>
                          <div>
                            <p className="font-medium">Car Color</p>
                            <p>{user.drivers[0].car_color}</p>
                          </div>
                          <div>
                            <p className="font-medium">Cylinders</p>
                            <p>{user.drivers[0].cylinders}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => handleViewUserDocuments(user)}>
                        <FileText className="w-4 h-4 mr-1" /> View Documents
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No pending driver applications</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Pending Passengers Tab */}
        <TabsContent value="passengers">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingPassengers.length > 0 ? (
              pendingPassengers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Passenger
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p>{user.whatsapp}</p>
                      </div>
                      <div>
                        <p className="font-medium">University</p>
                        <p>{user.universities.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Gender</p>
                        <p>{user.gender}</p>
                      </div>
                      <div>
                        <p className="font-medium">Registered</p>
                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {user.passengers && user.passengers[0] && (
                      <div className="p-3 space-y-3 border rounded-md">
                        <h4 className="font-medium">Preferences</h4>
                        <div className="text-sm">
                          <p className="font-medium">Gender Preference</p>
                          <p>{user.passengers[0].gender_preference === "same" ? "Same Gender Only" : "Any Gender"}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => handleViewUserDocuments(user)}>
                        <FileText className="w-4 h-4 mr-1" /> View Documents
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No pending passenger applications</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Role Switch Requests Tab */}
        <TabsContent value="switches">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {switchRequests.length > 0 ? (
              switchRequests.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        Switch Request
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Current Role</p>
                        <p>{user.role}</p>
                      </div>
                      <div>
                        <p className="font-medium">Requested Role</p>
                        <p>Driver</p>
                      </div>
                      <div>
                        <p className="font-medium">University</p>
                        <p>{user.universities.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Requested On</p>
                        <p>{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="p-3 space-y-2 border rounded-md bg-yellow-50">
                      <h4 className="font-medium text-yellow-800">Driver Information Required</h4>
                      <p className="text-sm text-yellow-700">
                        The user needs to submit driver details (car info, license) before approval.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectSwitch(user.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveSwitch(user.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No role switch requests</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Ride History Tab */}
        <TabsContent value="rides">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold">Ride History</h2>
                <p className="text-sm text-gray-500">View all rides and their status</p>
              </div>
              <div className="w-full md:w-64">
                <Select value={rideHistoryFilter} onValueChange={setRideHistoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter rides" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rides</SelectItem>
                    <SelectItem value="ongoing">Ongoing Rides</SelectItem>
                    <SelectItem value="completed">Completed Rides</SelectItem>
                    <SelectItem value="paid">Paid Rides</SelectItem>
                    <SelectItem value="pending">Pending Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredRides().length > 0 ? (
                    getFilteredRides().map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell className="font-medium">
                          {new Date(ride.created_at).toLocaleDateString()}
                          <div className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleTimeString()}</div>
                        </TableCell>
                        <TableCell>
                          {ride.driver.first_name} {ride.driver.last_name}
                          <div className="text-xs text-gray-500">
                            {ride.driver.drivers[0].car_model.brand} {ride.driver.drivers[0].car_model.model}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ride.passenger.first_name} {ride.passenger.last_name}
                          <div className="text-xs text-gray-500">{ride.passenger.universities.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(ride.status)}>
                            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusBadgeColor(ride.payment_status)}>
                            {ride.payment_status.charAt(0).toUpperCase() + ride.payment_status.slice(1)}
                          </Badge>
                          <div className="text-xs text-gray-500">{ride.payment_method}</div>
                        </TableCell>
                        <TableCell>${ride.estimated_cost?.toFixed(2)} USD</TableCell>
                        <TableCell>
                          {ride.payment_status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleUpdatePaymentStatus(ride.id, "paid")}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Mark Paid
                              </Button>
                            </div>
                          )}
                          {ride.payment_status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleUpdatePaymentStatus(ride.id, "pending")}
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Mark Unpaid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No rides found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium">Ongoing Rides</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">{ongoingRides.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-medium">Completed Rides</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">{completedRides.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-medium">Pending Payments</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    {[...ongoingRides, ...completedRides].filter((ride) => ride.payment_status === "pending").length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Fuel Price Tab */}
        <TabsContent value="fuel">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Current Fuel Price</h3>
                <div className="p-6 text-center bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Current price per liter</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    ${currentFuelPrice ? currentFuelPrice.toFixed(2) : "0.00"} <span className="text-lg">USD</span>
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Update Fuel Price</h3>
                <form onSubmit={handleUpdateFuelPrice} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuelPrice">New Fuel Price (USD/L)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <Input
                        id="fuelPrice"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.50"
                        className="pl-10"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Update Fuel Price
                  </Button>
                  <p className="text-xs text-gray-500 text-center">This will affect all new ride cost calculations</p>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Report #{report.id.slice(0, 8)}</h3>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {new Date(report.created_at).toLocaleDateString()}
                      </Badge>
                    </div>

                    <div className="p-3 space-y-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Reported User</p>
                          <p className="text-sm">
                            {report.to_user.first_name} {report.to_user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{report.to_user.email}</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          {countReportsForUser(report.to_user.id)} reports
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Reported by</p>
                      <p className="text-sm">
                        {report.from_user.first_name} {report.from_user.last_name}
                      </p>

                      <p className="font-medium">Reason</p>
                      <p className="text-sm">{report.reason}</p>

                      {report.details && (
                        <>
                          <p className="font-medium">Details</p>
                          <p className="text-sm">{report.details}</p>
                        </>
                      )}

                      {report.ride && (
                        <>
                          <p className="font-medium">Ride Date</p>
                          <p className="text-sm">{new Date(report.ride.created_at).toLocaleString()}</p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Report marked as reviewed",
                            description: "No action taken against the user",
                          })
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" /> Mark Reviewed
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleBanUser(report.to_user.id)}
                      >
                        <Ban className="w-4 h-4 mr-1" /> Ban User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No reports submitted</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Documents Dialog */}
      <Dialog open={showUserDocumentsDialog} onOpenChange={setShowUserDocumentsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Documents</DialogTitle>
            <DialogDescription>
              {viewingUser && `${viewingUser.first_name} ${viewingUser.last_name}'s verification documents`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {viewingUser && viewingUser.id_photo_url && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={viewingUser.id_photo_url || "/placeholder.svg"}
                      alt="University ID"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">University ID</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleViewImage(viewingUser.id_photo_url, "University ID")}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" /> View Full Size
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {viewingUser &&
              viewingUser.drivers &&
              viewingUser.drivers[0] &&
              viewingUser.drivers[0].license_photo_url && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <Image
                        src={viewingUser.drivers[0].license_photo_url || "/placeholder.svg"}
                        alt="Driver's License"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">Driver's License</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => handleViewImage(viewingUser.drivers[0].license_photo_url, "Driver's License")}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" /> View Full Size
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            {viewingUser && viewingUser.drivers && viewingUser.drivers[0] && viewingUser.drivers[0].car_photo_url && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={viewingUser.drivers[0].car_photo_url || "/placeholder.svg"}
                      alt="Car Photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">Car Photo</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleViewImage(viewingUser.drivers[0].car_photo_url, "Car Photo")}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" /> View Full Size
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {(!viewingUser ||
              (!viewingUser.id_photo_url &&
                (!viewingUser.drivers ||
                  !viewingUser.drivers[0] ||
                  (!viewingUser.drivers[0].license_photo_url && !viewingUser.drivers[0].car_photo_url)))) && (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No documents available for this user</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImageTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[70vh] overflow-hidden rounded-md">
            {selectedImage && (
              <Image src={selectedImage || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

