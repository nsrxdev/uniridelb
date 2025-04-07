import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/" className="flex items-center mb-6 text-emerald-700 hover:text-emerald-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-emerald-700">Privacy Policy</h1>

        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <p className="mb-4 text-sm text-gray-500">Last Updated: April 7, 2023</p>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to UniRide LB. We respect your privacy and are committed to protecting your personal data. This
                privacy policy will inform you about how we look after your personal data when you visit our website and
                use our services, and tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">2. Data We Collect</h2>
              <p className="mb-3 text-gray-700">We collect and process the following categories of personal data:</p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>Identity Data: first name, last name, university ID, driver's license (for drivers)</li>
                <li>Contact Data: email address, WhatsApp number</li>
                <li>Profile Data: gender, university, preferences</li>
                <li>Vehicle Data: car details, license plate (for drivers)</li>
                <li>Location Data: home address, GPS coordinates</li>
                <li>Usage Data: information about how you use our website and services</li>
                <li>Feedback Data: ratings and reports you provide about other users</li>
              </ul>
              <p className="text-gray-700">
                We collect special category data (such as gender) only for the purpose of providing gender-safe matching
                options, with your explicit consent.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">3. How We Use Your Data</h2>
              <p className="mb-3 text-gray-700">We use your personal data for the following purposes:</p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>To verify your identity and university enrollment</li>
                <li>To create and manage your account</li>
                <li>To provide our carpooling services</li>
                <li>To match drivers and passengers</li>
                <li>To calculate ride costs and facilitate payments</li>
                <li>To ensure safety through our verification and reporting systems</li>
                <li>To communicate with you about our services</li>
                <li>To improve our services</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">4. Data Sharing</h2>
              <p className="mb-3 text-gray-700">We share your personal data with:</p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>Other users (limited information necessary for carpooling)</li>
                <li>Service providers (e.g., hosting, database, payment processing)</li>
                <li>Legal authorities when required by law</li>
              </ul>
              <p className="text-gray-700">We do not sell your personal data to third parties.</p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">5. Data Security</h2>
              <p className="text-gray-700">
                We have implemented appropriate security measures to prevent your personal data from being accidentally
                lost, used, or accessed in an unauthorized way. We limit access to your personal data to those
                employees, agents, contractors, and other third parties who have a business need to know.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">6. Data Retention</h2>
              <p className="text-gray-700">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it
                for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">7. Your Rights</h2>
              <p className="mb-3 text-gray-700">
                Under certain circumstances, you have rights under data protection laws in relation to your personal
                data, including:
              </p>
              <ul className="pl-5 mb-3 space-y-2 list-disc text-gray-700">
                <li>The right to access your personal data</li>
                <li>The right to request correction of your personal data</li>
                <li>The right to request erasure of your personal data</li>
                <li>The right to object to processing of your personal data</li>
                <li>The right to request restriction of processing your personal data</li>
                <li>The right to data portability</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">8. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
                <br />
                Email:{" "}
                <a href="mailto:privacy@uniridelb.com" className="text-emerald-600 hover:underline">
                  privacy@uniridelb.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

