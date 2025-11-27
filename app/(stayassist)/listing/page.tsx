"use client"

import { useEffect, useState } from "react"
import { useFetchListingsMutation, Listing } from "@/states/features/endpoints/listings/listingsApiSlice"
import { ListingCard } from "@/components/listings/listing-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Loader2, Search, X, SlidersHorizontal, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function ListingsPage() {
  const [fetchListings, { isLoading }] = useFetchListingsMutation()
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [showFilters, setShowFilters] = useState(true)

  // Filter state
  const [cityFilter, setCityFilter] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadListings()
  }, [])

  useEffect(() => {
    // Reload listings when dates change to get availability from backend
    if (checkInDate && checkOutDate) {
      loadListingsWithDates()
    } else if (!checkInDate && !checkOutDate) {
      // If both dates are cleared, reload without date filters
      loadListings()
    }
  }, [checkInDate, checkOutDate])

  useEffect(() => {
    applyClientSideFilters()
  }, [listings, cityFilter, priceRange])

  const loadListings = async () => {
    try {
      const result = await fetchListings({}).unwrap()
      if (result.status) {
        setListings(result.data)
        updatePriceRange(result.data)
      } else {
        toast.error(result.message || "Failed to load listings")
      }
    } catch (error: any) {
      console.error("Error loading listings:", error)
      toast.error("Failed to load listings. Please try again.")
    }
  }

  const loadListingsWithDates = async () => {
    try {
      const result = await fetchListings({
        filters: {
          check_in: checkInDate,
          check_out: checkOutDate,
        }
      }).unwrap()

      if (result.status) {
        setListings(result.data)
        updatePriceRange(result.data)

        if (result.data.length === 0) {
          toast.info("No properties available for selected dates")
        }
      } else {
        toast.error(result.message || "Failed to load listings")
      }
    } catch (error: any) {
      console.error("Error loading listings:", error)
      toast.error("Failed to load listings. Please try again.")
    }
  }

  const updatePriceRange = (data: Listing[]) => {
    // Calculate max price from listings
    if (data.length > 0) {
      const prices = data.map((l: Listing) => parseFloat(l.price_per_night))
      const max = Math.ceil(Math.max(...prices))
      setMaxPrice(max)
      setPriceRange([0, max])
    } else {
      setMaxPrice(1000)
      setPriceRange([0, 1000])
    }
  }

  const applyClientSideFilters = () => {
    let filtered = [...listings]

    // City filter (case-insensitive)
    if (cityFilter.trim()) {
      filtered = filtered.filter((listing) =>
        listing.city.toLowerCase().includes(cityFilter.toLowerCase())
      )
    }

    // Price range filter
    filtered = filtered.filter((listing) => {
      const price = parseFloat(listing.price_per_night)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    setFilteredListings(filtered)
  }

  const handleClearFilters = () => {
    setCityFilter("")
    setPriceRange([0, maxPrice])
    setCheckInDate("")
    setCheckOutDate("")
  }

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value
    setCheckInDate(newCheckIn)

    // If check-out is before check-in, clear it
    if (checkOutDate && newCheckIn && checkOutDate <= newCheckIn) {
      setCheckOutDate("")
    }
  }

  const hasActiveFilters =
    cityFilter.trim() !== "" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== maxPrice ||
    checkInDate !== "" ||
    checkOutDate !== ""

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Explore Rentals</h1>
              <p className="text-muted-foreground mt-2">
                Find your perfect stay from our collection of rental properties
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Filters */}
                <div className="space-y-4 pb-4 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-base font-medium">Availability</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkIn" className="text-sm">Check-in</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkInDate}
                      onChange={handleCheckInChange}
                      min={today}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOut" className="text-sm">Check-out</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || today}
                      disabled={!checkInDate}
                      className="w-full"
                    />
                  </div>

                  {checkInDate && checkOutDate && (
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {(() => {
                        const nights = Math.ceil(
                          (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                        )
                        return `${nights} ${nights === 1 ? 'night' : 'nights'}`
                      })()}
                    </div>
                  )}
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="Search by city..."
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-4">
                  <Label>Price per night</Label>
                  <div className="space-y-4">
                    <Slider
                      min={0}
                      max={maxPrice}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Min</span>
                        <span className="font-medium">${priceRange[0]}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground">Max</span>
                        <span className="font-medium">${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-sm font-medium">Active Filters:</p>
                    <div className="space-y-1">
                      {(checkInDate || checkOutDate) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            Dates: {checkInDate ? new Date(checkInDate).toLocaleDateString() : '?'}
                            {' → '}
                            {checkOutDate ? new Date(checkOutDate).toLocaleDateString() : '?'}
                          </span>
                        </div>
                      )}
                      {cityFilter && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>City: {cityFilter}</span>
                        </div>
                      )}
                      {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Price: ${priceRange[0]} - ${priceRange[1]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-xl text-muted-foreground">
                  {listings.length === 0
                    ? checkInDate && checkOutDate
                      ? "No properties available for selected dates"
                      : "No listings available at the moment"
                    : "No properties match your filters"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {listings.length === 0
                    ? checkInDate && checkOutDate
                      ? "Try different dates to see available properties"
                      : "Check back later for new properties"
                    : "Try adjusting your filters to see more results"}
                </p>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} className="mt-4" variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredListings.length} {filteredListings.length === 1 ? "property" : "properties"} found
                    {checkInDate && checkOutDate && " available for your dates"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
