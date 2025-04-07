"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Shield } from "lucide-react"

// Hardcoded admin credentials
const ADMIN_USERNAME = "elionasr"
const ADMIN_PASSWORD = "elionasr2004"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check against hardcoded credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Set a session cookie or localStorage item to remember the admin is logged in
        localStorage.setItem("adminAuthenticated", "true")

        // Redirect to admin dashboard
        router.push("/admin-secret-2025")
      } else {
        throw new Error("Invalid username or password")
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen px-4 py-8 mx-auto">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Shield className="w-12 h-12 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-700">Admin Access</CardTitle>
          <CardDescription>This area is restricted to authorized personnel only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          <p className="w-full">Unauthorized access is prohibited and may be subject to legal action</p>
        </CardFooter>
      </Card>
    </div>
  )
}

