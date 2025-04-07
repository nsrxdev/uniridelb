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
import { ArrowLeft, Upload, Eye, EyeOff } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)

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
  const [availableSeats, setAvailableSeats] = useState("3") // Default to 3 seats

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

      if (universitiesData) {
        console.log("Universities data:", universitiesData)
      } else {
        console.log("No universities data found")
      }

      if (universitiesError) {
        console.error("Error details:", universitiesError)
        console.error("Error fetching universities:", universitiesError)

        // If no universities exist, create and populate the table
        if (universitiesError.code === "PGRST116") {
          // Table doesn't exist, create sample universities
          await createSampleUniversities()
        }
      } else {
        setUniversities(universitiesData || [])
      }

      // Fetch car models
      const { data: carModelsData, error: carModelsError } = await supabase
        .from("car_models")
        .select("*")
        .order("brand, model")

      if (carModelsError) {
        console.error("Error fetching car models:", carModelsError)

        // If no car models exist, create and populate the table
        if (carModelsError.code === "PGRST116") {
          // Table doesn't exist, create sample car models
          await createSampleCarModels()
        }
      } else {
        setCarModels(carModelsData || [])

        // Extract unique brands
        const brands = [...new Set(carModelsData.map((car) => car.brand))].sort()
        setUniqueBrands(brands)
      }
    }

    fetchData()
  }, [])

  // Create sample universities if the table doesn't exist
  const createSampleUniversities = async () => {
    const sampleUniversities = [
      { name: "American University of Beirut (AUB)", city: "Beirut", lat: 33.9, lng: 35.48 },
      { name: "Lebanese American University (LAU)", city: "Beirut", lat: 33.89, lng: 35.47 },
      { name: "Notre Dame University (NDU)", city: "Zouk Mosbeh", lat: 33.98, lng: 35.62 },
      { name: "Université Saint-Joseph (USJ)", city: "Beirut", lat: 33.88, lng: 35.5 },
      { name: "Lebanese University (LU)", city: "Beirut", lat: 33.87, lng: 35.51 },
      { name: "University of Balamand", city: "Koura", lat: 34.37, lng: 35.76 },
      { name: "Beirut Arab University (BAU)", city: "Beirut", lat: 33.88, lng: 35.49 },
      { name: "Holy Spirit University of Kaslik (USEK)", city: "Jounieh", lat: 33.98, lng: 35.65 },
    ]

    try {
      // Create the universities table
      const { error: createError } = await supabase.rpc("create_universities_table")

      if (createError) {
        console.error("Error creating universities table:", createError)
        return
      }

      // Insert sample data
      const { data, error } = await supabase.from("universities").insert(sampleUniversities).select()

      if (error) {
        console.error("Error inserting universities:", error)
      } else {
        console.log("Successfully added universities:", data)
        setUniversities(data)
      }
    } catch (error) {
      console.error("Error in createSampleUniversities:", error)
    }
  }

  // Create sample car models if the table doesn't exist
  const createSampleCarModels = async () => {
    const sampleCarModels = [
      { brand: "Toyota", model: "Corolla" },
      { brand: "Toyota", model: "Camry" },
      { brand: "Toyota", model: "RAV4" },
      { brand: "Honda", model: "Civic" },
      { brand: "Honda", model: "Accord" },
      { brand: "Honda", model: "CR-V" },
      { brand: "Nissan", model: "Altima" },
      { brand: "Nissan", model: "Sentra" },
      { brand: "Nissan", model: "Rogue" },
      { brand: "Hyundai", model: "Elantra" },
      { brand: "Hyundai", model: "Sonata" },
      { brand: "Hyundai", model: "Tucson" },
      { brand: "Kia", model: "Optima" },
      { brand: "Kia", model: "Forte" },
      { brand: "Kia", model: "Sportage" },
      { brand: "BMW", model: "3 Series" },
      { brand: "BMW", model: "5 Series" },
      { brand: "BMW", model: "X3" },
      { brand: "Mercedes-Benz", model: "C-Class" },
      { brand: "Mercedes-Benz", model: "E-Class" },
      { brand: "Mercedes-Benz", model: "GLC" },
    ]

    try {
      // Create the car_models table
      const { error: createError } = await supabase.rpc("create_car_models_table")

      if (createError) {
        console.error("Error creating car_models table:", createError)
        return
      }

      // Insert sample data
      const { data, error } = await supabase.from("car_models").insert(sampleCarModels).select()

      if (error) {
        console.error("Error inserting car models:", error)
      } else {
        console.log("Successfully added car models:", data)
        setCarModels(data)

        // Extract unique brands
        const brands = [...new Set(data.map((car) => car.brand))].sort()
        setUniqueBrands(brands)
      }
    } catch (error) {
      console.error("Error in createSampleCarModels:", error)
    }
  }

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
            available_seats: Number.parseInt(availableSeats),
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                    {universities.length > 0 ? (
                      universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          {university.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No universities found
                      </SelectItem>
                    )}
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
                <Label htmlFor="availableSeats">Available Seats</Label>
                <Select value={availableSeats} onValueChange={setAvailableSeats}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of seats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Seat</SelectItem>
                    <SelectItem value="2">2 Seats</SelectItem>
                    <SelectItem value="3">3 Seats</SelectItem>
                    <SelectItem value="4">4 Seats</SelectItem>
                    <SelectItem value="5">5 Seats</SelectItem>
                    <SelectItem value="6">6 Seats</SelectItem>
                  </SelectContent>
                </Select>
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

