import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, Users, Shield, Car } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container px-4 py-8 mx-auto">
        <header className="flex flex-col items-center justify-center py-8 text-center">
          <h1 className="text-4xl font-bold text-emerald-700">UniRide LB</h1>
          <p className="mt-2 text-lg text-gray-600">Safe Carpooling for Lebanese University Students</p>
        </header>

        <div className="grid gap-6 mt-8 md:grid-cols-2">
          <Card className="border-emerald-100 shadow-md">
            <CardHeader>
              <CardTitle className="text-emerald-700">For Drivers</CardTitle>
              <CardDescription>Share your ride and split fuel costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <Car className="w-5 h-5 text-emerald-600" />
                <span>Register your vehicle details</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Set your route to university</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Connect with passengers</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/register?role=driver" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Register as Driver</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-emerald-100 shadow-md">
            <CardHeader>
              <CardTitle className="text-emerald-700">For Passengers</CardTitle>
              <CardDescription>Find safe rides to your university</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Find drivers near your location</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Gender-safe matching available</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Connect with verified drivers</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/register?role=passenger" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Register as Passenger</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-emerald-700">How It Works</h2>
          <div className="grid gap-6 mt-6 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-white shadow">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-700">
                1
              </div>
              <h3 className="mb-2 font-semibold">Register & Verify</h3>
              <p className="text-sm text-gray-600">Create an account and verify your university ID</p>
            </div>
            <div className="p-4 rounded-lg bg-white shadow">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-700">
                2
              </div>
              <h3 className="mb-2 font-semibold">Connect</h3>
              <p className="text-sm text-gray-600">Find drivers or passengers going to your university</p>
            </div>
            <div className="p-4 rounded-lg bg-white shadow">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-700">
                3
              </div>
              <h3 className="mb-2 font-semibold">Ride & Save</h3>
              <p className="text-sm text-gray-600">Share rides, split costs, and reduce traffic</p>
            </div>
          </div>
        </div>

        <footer className="py-8 mt-12 text-center text-gray-600">
          <p>© 2023 UniRide LB. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/about" className="text-emerald-600 hover:underline">
              About
            </Link>
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-emerald-600 hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="text-emerald-600 hover:underline">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}

