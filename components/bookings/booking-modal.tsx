"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useCreateBookingMutation } from "@/states/features/endpoints/bookings/bookingsApiSlice"
import { selectIsAuthenticated, selectCurrentUser } from "@/states/features/slices/auth/authSlice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  listingTitle: string
  pricePerNight: string
  maxGuests: number
}

export function BookingModal({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  pricePerNight,
  maxGuests,
}: BookingModalProps) {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  const [createBooking, { isLoading }] = useCreateBookingMutation()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  console.log("AUTHENTICATED", isAuthenticated, currentUser);


  const [formData, setFormData] = useState({
    check_in: "",
    check_out: "",
    number_of_guests: 1,
  })

  const [errors, setErrors] = useState<{
    check_in?: string
    check_out?: string
    number_of_guests?: string
  }>({})

  const [totalPrice, setTotalPrice] = useState(0)
  const [nights, setNights] = useState(0)

  // Calculate total price when dates change
  useEffect(() => {
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      const nightCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      if (nightCount > 0) {
        setNights(nightCount)
        setTotalPrice(nightCount * parseFloat(pricePerNight))
      } else {
        setNights(0)
        setTotalPrice(0)
      }
    } else {
      setNights(0)
      setTotalPrice(0)
    }
  }, [formData.check_in, formData.check_out, pricePerNight])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.check_in) {
      newErrors.check_in = "Check-in date is required"
    } else {
      const checkInDate = new Date(formData.check_in)
      if (checkInDate < new Date(today)) {
        newErrors.check_in = "Check-in date cannot be in the past"
      }
    }

    if (!formData.check_out) {
      newErrors.check_out = "Check-out date is required"
    } else if (formData.check_in && formData.check_out <= formData.check_in) {
      newErrors.check_out = "Check-out must be after check-in"
    }

    if (formData.number_of_guests < 1) {
      newErrors.number_of_guests = "At least 1 guest is required"
    } else if (formData.number_of_guests > maxGuests) {
      newErrors.number_of_guests = `Maximum ${maxGuests} guests allowed`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to book a property")
      router.push("/login")
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      if (!currentUser?.user?.id) {
        toast.error("User information not found. Please log in again.")
        return
      }

      const result = await createBooking({
        listing_id: listingId,
        check_in: formData.check_in,
        check_out: formData.check_out,
        number_of_guests: formData.number_of_guests,
        user: currentUser.user.id,
      }).unwrap()

      if (result.status) {
        toast.success("Booking created successfully!")
        onOpenChange(false)
        // Reset form
        setFormData({
          check_in: "",
          check_out: "",
          number_of_guests: 1,
        })
      } else {
        toast.error(result.message || "Failed to create booking")
      }
    } catch (error: any) {
      console.error("Booking error:", error)
      if (error.data?.message) {
        toast.error(error.data.message)
      } else {
        toast.error("Failed to create booking. Please try again.")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'number_of_guests' ? parseInt(value) || 0 : value
    }))

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value
    setFormData(prev => ({ ...prev, check_in: newCheckIn }))

    // If check-out is before check-in, clear it
    if (formData.check_out && newCheckIn && formData.check_out <= newCheckIn) {
      setFormData(prev => ({ ...prev, check_out: "" }))
    }

    if (errors.check_in) {
      setErrors(prev => ({ ...prev, check_in: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Your Stay</DialogTitle>
          <DialogDescription>
            Complete the details below to book {listingTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="check_in" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-in Date
              </Label>
              <Input
                id="check_in"
                name="check_in"
                type="date"
                value={formData.check_in}
                onChange={handleCheckInChange}
                min={today}
                aria-invalid={!!errors.check_in}
                disabled={isLoading}
              />
              {errors.check_in && (
                <p className="text-sm text-destructive">{errors.check_in}</p>
              )}
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="check_out" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-out Date
              </Label>
              <Input
                id="check_out"
                name="check_out"
                type="date"
                value={formData.check_out}
                onChange={handleChange}
                min={formData.check_in || today}
                disabled={!formData.check_in || isLoading}
                aria-invalid={!!errors.check_out}
              />
              {errors.check_out && (
                <p className="text-sm text-destructive">{errors.check_out}</p>
              )}
            </div>

            {/* Number of Guests */}
            <div className="space-y-2">
              <Label htmlFor="number_of_guests" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Guests
              </Label>
              <Input
                id="number_of_guests"
                name="number_of_guests"
                type="number"
                min="1"
                max={maxGuests}
                value={formData.number_of_guests}
                onChange={handleChange}
                aria-invalid={!!errors.number_of_guests}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Maximum {maxGuests} guests
              </p>
              {errors.number_of_guests && (
                <p className="text-sm text-destructive">{errors.number_of_guests}</p>
              )}
            </div>

            {/* Price Summary */}
            {nights > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span className="font-medium">${(nights * parseFloat(pricePerNight)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
