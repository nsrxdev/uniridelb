"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface University {
  id: string
  name: string
  city: string
}

interface CarModel {
  id: string
  brand: string
  model: string
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "passenger"
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<string>(defaultRole)
  const { toast } = useToast()
  const { signUp, isLoading } = useAuth()

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [gender, setGender] = useState("male")
  const [universityId, setUniversityId] = useState("")
  const [idPhoto, setIdPhoto] = useState<File | null>(null)

  // Driver specific state
  const [plateNumber, setPlateNumber] = useState("")
  const [carModelId, setCarModelId] = useState("")
  const [carYear, setCarYear] = useState("")
  const [cylinders, setCylinders] = useState("")
  const [carColor, setCarColor] = useState("")
  const [carPhoto, setCarPhoto] = useState<File | null>(null)
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null)
  const [homeAddress, setHomeAddress] = useState("")
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  // Passenger specific state
  const [genderPreference, setGenderPreference] = useState("same")

  // Data from Supabase
  const [universities, setUniversities] = useState<University[]>([])
  const [carModels, setCarModels] = useState<CarModel[]>([])
  const [uniqueBrands, setUniqueBrands] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [filteredModels, setFilteredModels] = useState<CarModel[]>([])

  // Fetch universities and car models on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch universities
      const { data: universitiesData, error: universitiesError } = await supabase
        .from("universities")
        .select("*")
        .order("name")

      if (universitiesError) {
        console.error("Error fetching universities:", universitiesError)
      } else {
        setUniversities(universitiesData)
      }

      // Fetch car models
      const { data: carModelsData, error: carModelsError } = await supabase
        .from("car_models")
        .select("*")
        .order("brand, model")

      if (carModelsError) {
        console.error("Error fetching car models:", carModelsError)
      } else {
        setCarModels(carModelsData)

        // Extract unique brands
        const brands = [...new Set(carModelsData.map((car) => car.brand))].sort()
        setUniqueBrands(brands)
      }
    }

    fetchData()
  }, [])

  // Filter car models when brand changes
  useEffect(() => {
    if (selectedBrand) {
      setFilteredModels(carModels.filter((car) => car.brand === selectedBrand))
    } else {
      setFilteredModels([])
    }
  }, [selectedBrand, carModels])

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude)
          setLng(position.coords.longitude)
          toast({
            title: "Location detected",
            description: `Latitude: ${position.coords.latitude.toFixed(6)}, Longitude: ${position.coords.longitude.toFixed(6)}`,
          })
        },
        (error) => {
          toast({
            title: "Error getting location",
            description: error.message,
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0])
    }
  }

  const handleSubmitBasicInfo = (e: React.FormEvent) => {
    e.preventDefault()

    if (!idPhoto) {
      toast({
        title: "Missing university ID",
        description: "Please upload your university ID photo",
        variant: "destructive",
      })
      return
    }

    setStep(2)
    toast({
      title: "Basic information saved",
      description: "Please complete your profile information",
    })
  }

  const handleSubmitRoleInfo = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate role-specific requirements
      if (role === "driver") {
        if (!licensePhoto) {
          throw new Error("Please upload your driver's license photo")
        }
        if (!lat || !lng) {
          throw new Error("Please get your current location")
        }
      }

      // Register the user with Supabase Auth
      await signUp(email, password, {
        firstName,
        lastName,
        whatsapp,
        gender,
        universityId,
        role,
      })

      // Upload files to Supabase Storage
      const user = (await supabase.auth.getUser()).data.user

      if (user) {
        // Upload university ID photo
        if (idPhoto) {
          const { error: idPhotoError } = await supabase.storage
            .from("id-photos")
            .upload(`${user.id}/university-id`, idPhoto)

          if (idPhotoError) throw idPhotoError

          // Get the public URL
          const { data: idPhotoUrl } = supabase.storage.from("id-photos").getPublicUrl(`${user.id}/university-id`)

          // Update the user record with the photo URL
          await supabase.from("users").update({ id_photo_url: idPhotoUrl.publicUrl }).eq("id", user.id)
        }

        // If user is a driver, store driver-specific info
        if (role === "driver") {
          // Upload car photo
          let carPhotoUrl = null
          if (carPhoto) {
            const { error: carPhotoError } = await supabase.storage
              .from("car-photos")
              .upload(`${user.id}/car-photo`, carPhoto)

            if (carPhotoError) throw carPhotoError

            const { data: carPhotoData } = supabase.storage.from("car-photos").getPublicUrl(`${user.id}/car-photo`)

            carPhotoUrl = carPhotoData.publicUrl
          }

          // Upload license photo
          let licensePhotoUrl = null
          if (licensePhoto) {
            const { error: licensePhotoError } = await supabase.storage
              .from("license-photos")
              .upload(`${user.id}/license-photo`, licensePhoto)

            if (licensePhotoError) throw licensePhotoError

            const { data: licensePhotoData } = supabase.storage
              .from("license-photos")
              .getPublicUrl(`${user.id}/license-photo`)

            licensePhotoUrl = licensePhotoData.publicUrl
          }

          // Insert driver record
          const { error: driverError } = await supabase.from("drivers").insert({
            user_id: user.id,
            car_model_id: carModelId,
            car_year: Number.parseInt(carYear),
            car_color: carColor,
            plate_number: plateNumber,
            cylinders: Number.parseInt(cylinders),
            car_photo_url: carPhotoUrl,
            license_photo_url: licensePhotoUrl,
            home_address: homeAddress,
            lat,
            lng,
            is_live: false,
          })

          if (driverError) throw driverError
        }

        // If user is a passenger, store passenger-specific info
        if (role === "passenger") {
          const { error: passengerError } = await supabase.from("passengers").insert({
            user_id: user.id,
            gender_preference: genderPreference,
          })

          if (passengerError) throw passengerError
        }
      }

      toast({
        title: "Registration submitted",
        description: "Your account is pending approval. We'll notify you once it's approved.",
      })

      // Redirect to success page
      window.location.href = "/registration-success"
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/" className="flex items-center mb-6 text-emerald-700 hover:text-emerald-800">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <Card className="max-w-lg mx-auto border-emerald-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-emerald-700">Register for UniRide LB</CardTitle>
          <CardDescription>
            {step === 1
              ? "Create your account to start carpooling safely"
              : role === "driver"
                ? "Driver information"
                : "Passenger preferences"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSubmitBasicInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                  />
                  <p className="text-xs text-gray-500">Cannot be changed later</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                  />
                  <p className="text-xs text-gray-500">Cannot be changed later</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+961 XX XXX XXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select value={universityId} onValueChange={setUniversityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idPhoto">University ID Photo</Label>
                <div
                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer"
                  onClick={() => document.getElementById("idPhoto")?.click()}
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{idPhoto ? idPhoto.name : "Upload ID Photo"}</span>
                  <Input
                    id="idPhoto"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setIdPhoto)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>I want to be a:</Label>
                <Tabs defaultValue={role} onValueChange={setRole}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="driver">Driver</TabsTrigger>
                    <TabsTrigger value="passenger">Passenger</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Continue
              </Button>
            </form>
          ) : role === "driver" ? (
            <form onSubmit={handleSubmitRoleInfo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Car Plate Number</Label>
                <Input
                  id="plateNumber"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="123456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carBrand">Car Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carModel">Car Model</Label>
                <Select value={carModelId} onValueChange={setCarModelId} disabled={!selectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedBrand ? "Select model" : "Select brand first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carYear">Car Year</Label>
                  <Select value={carYear} onValueChange={setCarYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 36 }, (_, i) => 2025 - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cylinders">Number of Cylinders</Label>
                  <Select value={cylinders} onValueChange={setCylinders}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cylinders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Cylinders</SelectItem>
                      <SelectItem value="6">6 Cylinders</SelectItem>
                      <SelectItem value="8">8 Cylinders</SelectItem>
                      <SelectItem value="12">12 Cylinders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carColor">Car Color</Label>
                <Input
                  id="carColor"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  placeholder="e.g. Black"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carPhoto">Car Photo</Label>
                <div
                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer"
                  onClick={() => document.getElementById("carPhoto")?.click()}
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{carPhoto ? carPhoto.name : "Upload Car Photo"}</span>
                  <Input
                    id="carPhoto"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setCarPhoto)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePhoto" className="font-medium text-emerald-700">
                  Driver's License Photo (Required)
                </Label>
                <div
                  className="flex items-center gap-2 p-3 border-2 border-dashed border-emerald-200 rounded-md bg-emerald-50 cursor-pointer"
                  onClick={() => document.getElementById("licensePhoto")?.click()}
                >
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">{licensePhoto ? licensePhoto.name : "Upload Driver's License Photo"}</span>
                  <Input
                    id="licensePhoto"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLicensePhoto)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">This is required for verification and safety purposes</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeAddress">Home Address</Label>
                <Input
                  id="homeAddress"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Your home address"
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Get Current Location {lat && lng ? "✓" : ""}
              </Button>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit for Approval"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitRoleInfo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="genderPreference">Gender Matching Preference</Label>
                <RadioGroup value={genderPreference} onValueChange={setGenderPreference} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same" id="same" />
                    <Label htmlFor="same">Same Gender Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="any" />
                    <Label htmlFor="any">Any Gender</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit for Approval"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

