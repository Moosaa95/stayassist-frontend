import Link from "next/link"
import { Listing } from "@/states/features/endpoints/listings/listingsApiSlice"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const hostName = `${listing.host__first_name} ${listing.host__last_name}`
  const firstPhoto = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Image Section */}
        {firstPhoto ? (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <img
              src={firstPhoto}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative h-48 w-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}

        {/* Content Section */}
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1 text-lg">{listing.title}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3" />
            {listing.city}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-3 border-t">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              ${listing.price_per_night}
            </span>
            <span className="text-xs text-muted-foreground">per night</span>
          </div>
          <div className="flex flex-col items-end text-sm">
            <p className="text-muted-foreground">Hosted by</p>
            <p className="font-medium">{hostName}</p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
