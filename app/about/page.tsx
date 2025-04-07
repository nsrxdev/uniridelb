import Link from "next/link"
import { ArrowLeft, Car, Users, Shield, MapPin, School } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/" className="flex items-center mb-6 text-emerald-700 hover:text-emerald-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-emerald-700">About UniRide LB</h1>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Our Mission</h2>
          <p className="mb-4 text-gray-700">
            UniRide LB was created to address the transportation challenges faced by university students in Lebanon. In
            a country where public transportation is limited and fuel costs are high, we provide a safe, reliable, and
            cost-effective carpooling solution specifically designed for the university community.
          </p>
          <p className="text-gray-700">
            Our mission is to connect students who need rides with those who have extra space in their cars, creating a
            community-based transportation network that reduces costs, traffic congestion, and environmental impact
            while ensuring safety and reliability.
          </p>
        </div>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">How UniRide LB Works</h2>

          <div className="mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Verified University Students Only</h3>
                <p className="text-gray-600">
                  Every user must verify their identity with a university ID. Our admin team reviews and approves each
                  registration to ensure only legitimate university students can use the platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Safety First</h3>
                <p className="text-gray-600">
                  Drivers must provide their driver's license and car information. Passengers can choose gender-safe
                  matching. Our rating and reporting system helps maintain community standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Real-time Ride Finding</h3>
                <p className="text-gray-600">
                  Drivers can go live when they're available. Passengers can see available drivers on a map, view their
                  routes, and send ride requests directly through the app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Fair Cost Sharing</h3>
                <p className="text-gray-600">
                  Our system automatically calculates trip costs based on distance, car type, and current fuel prices,
                  ensuring fair cost sharing between drivers and passengers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Universities We Serve</h2>
          <p className="mb-4 text-gray-700">
            UniRide LB is available to students from all universities across Lebanon, including:
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>American University of Beirut (AUB)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Lebanese American University (LAU)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Notre Dame University (NDU)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Université Saint-Joseph (USJ)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Lebanese University (LU)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>University of Balamand</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Beirut Arab University (BAU)</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Holy Spirit University of Kaslik (USEK)</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Contact Us</h2>
          <p className="mb-4 text-gray-700">Have questions, suggestions, or need assistance? We're here to help!</p>
          <p className="text-gray-700">
            Email:{" "}
            <a href="mailto:support@uniridelb.com" className="text-emerald-600 hover:underline">
              support@uniridelb.com
            </a>
            <br />
            WhatsApp: +961 XX XXX XXX
            <br />
            Instagram: @uniridelb
          </p>
        </div>
      </div>
    </div>
  )
}

