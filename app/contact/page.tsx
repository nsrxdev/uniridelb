import Link from "next/link"
import { ArrowLeft, Mail, Phone, MessageSquare, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/" className="flex items-center mb-6 text-emerald-700 hover:text-emerald-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-emerald-700">Contact Us</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Get in Touch</h2>
              <p className="mb-6 text-gray-700">
                Have questions or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as
                soon as possible.
              </p>

              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message" className="min-h-[120px]" />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">
                      <a href="mailto:support@uniridelb.com" className="text-emerald-600 hover:underline">
                        support@uniridelb.com
                      </a>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">We aim to respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">+961 XX XXX XXX</p>
                    <p className="mt-1 text-sm text-gray-500">Monday to Friday, 9am to 5pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">WhatsApp</h3>
                    <p className="text-gray-600">+961 XX XXX XXX</p>
                    <p className="mt-1 text-sm text-gray-500">For quick assistance</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">
                      Beirut Digital District
                      <br />
                      Beirut, Lebanon
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 mt-6 text-center rounded-md bg-emerald-50">
                <h3 className="mb-2 font-medium text-emerald-700">Follow Us</h3>
                <div className="flex justify-center gap-4">
                  <a href="#" className="text-emerald-600 hover:text-emerald-800">
                    Instagram
                  </a>
                  <a href="#" className="text-emerald-600 hover:text-emerald-800">
                    Twitter
                  </a>
                  <a href="#" className="text-emerald-600 hover:text-emerald-800">
                    Facebook
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

