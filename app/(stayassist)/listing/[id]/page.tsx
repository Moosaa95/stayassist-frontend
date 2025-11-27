"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFetchListingDetailMutation } from "@/states/features/endpoints/listings/listingsApiSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingModal } from "@/components/bookings/booking-modal"
import { Loader2, MapPin, User, Calendar, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import type { ListingDetail } from "@/states/features/endpoints/listings/listingsApiSlice"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [fetchListingDetail, { isLoading }] = useFetchListingDetailMutation()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadListing()
    }
  }, [params.id])

  const loadListing = async () => {
    try {
      const result = await fetchListingDetail({ id: params.id as string }).unwrap()
      if (result.status && result.data) {
        setListing(result.data)
      } else {
        toast.error(result.message || "Failed to load listing details")
      }
    } catch (error: any) {
      console.error("Error loading listing:", error)
      toast.error("Failed to load listing. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading listing details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-muted-foreground">Listing not found</p>
          <Button onClick={() => router.push("/listing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </div>
      </div>
    )
  }

  const hostName = `${listing.host__first_name} ${listing.host__last_name}`

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/listing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery */}
            {listing.photos && listing.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                {listing.photos.slice(1, 5).map((photo, index) => (
                  <div key={index}>
                    <img
                      src={photo}
                      alt={`${listing.title} - ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Title and Location */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{listing.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{listing.city}</span>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this place</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Maximum Guests</p>
                    <p className="text-sm text-muted-foreground">{listing.max_guests} guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Bookings</p>
                    <p className="text-sm text-muted-foreground">{listing.total_bookings} bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Price Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">
                    ${listing.price_per_night}
                    <span className="text-base font-normal text-muted-foreground"> / night</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setBookingModalOpen(true)}
                  >
                    Book Now
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    You won&apos;t be charged yet
                  </p>
                </CardContent>
              </Card>

              {/* Host Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Hosted by</CardTitle>
                  <CardDescription>{hostName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Contact: {listing.host__email}
                  </p>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Listed on: {new Date(listing.created_at).toLocaleDateString()}</p>
                    <p>Last updated: {new Date(listing.updated_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        pricePerNight={listing.price_per_night}
        maxGuests={listing.max_guests}
      />
    </div>
  )
}
