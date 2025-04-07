"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Skip authentication check if we're already on the login page
  const isLoginPage = pathname === "/admin-secret-2025/login"

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check if we're on the login page
      if (isLoginPage) {
        setIsAuthenticated(true)
        return
      }

      // Check if admin is logged in using localStorage
      const adminAuthenticated = localStorage.getItem("adminAuthenticated") === "true"

      if (!adminAuthenticated) {
        router.push("/admin-secret-2025/login")
        return
      }

      setIsAuthenticated(true)
    }

    checkAuth()
  }, [router, isLoginPage, pathname])

  if (isAuthenticated === null && !isLoginPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>
}

