import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/" className="flex items-center mb-6 text-emerald-700 hover:text-emerald-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-emerald-700">Terms of Service</h1>

        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <p className="mb-4 text-sm text-gray-500">Last Updated: April 7, 2023</p>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to UniRide LB. These Terms of Service govern your use of our website and services. By using
                UniRide LB, you agree to these Terms. Please read them carefully.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">2. Eligibility</h2>
              <p className="text-gray-700">
                To use UniRide LB, you must be a currently enrolled student at a recognized university in Lebanon. You
                must be at least 18 years old. Drivers must possess a valid driver's license and have a vehicle in good
                working condition.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">3. Account Registration</h2>
              <p className="text-gray-700">
                You must register for an account to use our services. You agree to provide accurate, current, and
                complete information during the registration process and to update such information to keep it accurate,
                current, and complete. You are responsible for safeguarding your password and for all activities that
                occur under your account.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">4. Verification Process</h2>
              <p className="text-gray-700">
                All users must complete our verification process, which includes providing a university ID. Drivers must
                additionally provide their driver's license and vehicle information. We reserve the right to reject any
                registration or to suspend or terminate accounts that do not meet our verification standards.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">5. User Conduct</h2>
              <p className="mb-3 text-gray-700">You agree not to:</p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>Use our services for any illegal purpose</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Impersonate another user or person</li>
                <li>Use the service for commercial purposes</li>
                <li>Provide false or misleading information</li>
                <li>Violate the safety and comfort of other users</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">6. Carpooling Rules</h2>
              <p className="mb-3 text-gray-700">As a driver, you agree to:</p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>Drive safely and follow all traffic laws</li>
                <li>Maintain your vehicle in good working condition</li>
                <li>Have valid insurance for your vehicle</li>
                <li>Arrive at the agreed pickup location on time</li>
                <li>Follow the agreed route to the destination</li>
                <li>Treat passengers with respect</li>
              </ul>

              <p className="mb-3 text-gray-700">As a passenger, you agree to:</p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>Be at the agreed pickup location on time</li>
                <li>Pay the agreed fare</li>
                <li>Treat the driver and their vehicle with respect</li>
                <li>Wear a seatbelt at all times</li>
                <li>Not distract the driver while they are driving</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">7. Payments</h2>
              <p className="text-gray-700">
                Passengers agree to pay drivers the calculated fare for each ride. UniRide LB provides cost estimates
                based on distance, vehicle type, and current fuel prices. Payment methods and timing are agreed between
                users. UniRide LB is not responsible for any payment disputes between users.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">8. Ratings and Reports</h2>
              <p className="text-gray-700">
                Users can rate and report each other after completing a ride. We encourage honest feedback. False
                reports or abuse of the rating system may result in account suspension. Users with multiple legitimate
                negative reports may have their accounts suspended or terminated.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">9. Limitation of Liability</h2>
              <p className="text-gray-700">
                UniRide LB is a platform that connects drivers and passengers. We are not responsible for the actions of
                users, the condition of vehicles, or the quality of rides. We do not guarantee the availability of rides
                or drivers. Use of our service is at your own risk.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">10. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account at any time for any reason, including if you violate these
                Terms. You may terminate your account at any time by contacting us.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">11. Changes to Terms</h2>
              <p className="text-gray-700">
                We may modify these Terms at any time. We will provide notice of significant changes. Your continued use
                of our services after such modifications constitutes your acceptance of the modified Terms.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">12. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
                <br />
                Email:{" "}
                <a href="mailto:terms@uniridelb.com" className="text-emerald-600 hover:underline">
                  terms@uniridelb.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

