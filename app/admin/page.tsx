"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft, Check, X, Ban, Eye } from "lucide-react"

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [approvedUsers, setApprovedUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      setIsLoading(true)

      // Check if current user is admin
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      // For simplicity, we'll check if the user's email is an admin email
      // In a real app, you would have an admin role in your database
      const adminEmails = ["admin@uniride.com"] // Replace with your admin email
      const isUserAdmin = adminEmails.includes(user.email || "")

      setIsAdmin(isUserAdmin)

      if (!isUserAdmin) {
        setIsLoading(false)
        return
      }

      // Fetch pending users
      const { data: pendingData, error: pendingError } = await supabase
        .from("pending_approvals")
        .select("*")
        .order("created_at", { ascending: false })

      if (pendingError) {
        console.error("Error fetching pending users:", pendingError)
      } else {
        setPendingUsers(pendingData || [])
      }

      // Fetch approved users
      const { data: approvedData, error: approvedError } = await supabase
        .from("users")
        .select(`
          *,
          universities!inner(name),
          drivers(*),
          passengers(*)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      if (approvedError) {
        console.error("Error fetching approved users:", approvedError)
      } else {
        setApprovedUsers(approvedData || [])
      }

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select(`
          *,
          from_user:from_user_id(first_name, last_name),
          to_user:to_user_id(first_name, last_name)
        `)
        .order("created_at", { ascending: false })

      if (reportsError) {
        console.error("Error fetching reports:", reportsError)
      } else {
        setReports(reportsData || [])
      }

      setIsLoading(false)
    }

    checkAdminAndLoadData()
  }, [])

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("approve_user", { user_id: userId })

      if (error) throw error

      // Update the UI
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))

      // Refresh approved users
      const { data, error: fetchError } = await supabase
        .from("users")
        .select(`
          *,
          universities!inner(name),
          drivers(*),
          passengers(*)
        `)
        .eq("id", userId)
        .single()

      if (fetchError) throw fetchError

      setApprovedUsers([data, ...approvedUsers])

      toast({
        title: "User approved",
        description: "The user has been approved successfully",
      })
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
      const { error } = await supabase.from("users").update({ status: "rejected" }).eq("id", userId)

      if (error) throw error

      // Update the UI
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))

      toast({
        title: "User rejected",
        description: "The user has been rejected successfully",
      })
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
      const { error } = await supabase.rpc("ban_user", { user_id: userId })

      if (error) throw error

      // Update the UI
      setApprovedUsers(approvedUsers.map((user) => (user.id === userId ? { ...user, status: "banned" } : user)))

      toast({
        title: "User banned",
        description: "The user has been banned successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error banning user",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleViewUserDetails = (userId: string) => {
    // In a real app, you would navigate to a user details page
    // For now, we'll just show a toast
    toast({
      title: "View user details",
      description: `Viewing details for user ID: ${userId}`,
    })
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen px-4 py-8 mx-auto">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-screen px-4 py-8 mx-auto">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You do not have permission to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please contact the system administrator if you believe this is an error.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-emerald-700">Admin Dashboard</h1>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
          Admin Mode
        </Badge>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="pending" className="flex-1">
            Pending Approvals
            {pendingUsers.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1">
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1">
            Reports
            {reports.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {user.role}
                      </Badge>
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p>
                        <strong>WhatsApp:</strong> {user.whatsapp}
                      </p>
                      <p>
                        <strong>Gender:</strong> {user.gender}
                      </p>
                      <p>
                        <strong>University:</strong> {user.university}
                      </p>
                      <p>
                        <strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
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
                <p>No pending approvals</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedUsers.length > 0 ? (
              approvedUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          user.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p>
                        <strong>Role:</strong> {user.role}
                      </p>
                      <p>
                        <strong>WhatsApp:</strong> {user.whatsapp}
                      </p>
                      <p>
                        <strong>University:</strong> {user.universities.name}
                      </p>

                      {user.role === "driver" && user.drivers && user.drivers[0] && (
                        <>
                          <p>
                            <strong>Car:</strong> {user.drivers[0].car_color} {user.drivers[0].car_year}
                          </p>
                          <p>
                            <strong>Plate:</strong> {user.drivers[0].plate_number}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewUserDetails(user.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Details
                      </Button>
                      {user.status !== "banned" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleBanUser(user.id)}
                        >
                          <Ban className="w-4 h-4 mr-1" /> Ban
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No approved users</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Report #{report.id.slice(0, 8)}</CardTitle>
                    <CardDescription>{new Date(report.created_at).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p>
                        <strong>From:</strong> {report.from_user.first_name} {report.from_user.last_name}
                      </p>
                      <p>
                        <strong>Against:</strong> {report.to_user.first_name} {report.to_user.last_name}
                      </p>
                      <p>
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      {report.details && (
                        <p>
                          <strong>Details:</strong> {report.details}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewUserDetails(report.to_user_id)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleBanUser(report.to_user_id)}
                      >
                        <Ban className="w-4 h-4 mr-1" /> Ban User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>No reports</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

