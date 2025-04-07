import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function RegistrationSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen px-4 py-8 mx-auto">
      <Card className="max-w-md mx-auto text-center border-emerald-100 shadow-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl text-emerald-700">Registration Submitted</CardTitle>
          <CardDescription>Your account is pending approval</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Thank you for registering with UniRide LB. Our admin team will review your information and approve your
            account shortly.
          </p>
          <p className="mt-4 text-gray-600">You will receive an email notification once your account is approved.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

