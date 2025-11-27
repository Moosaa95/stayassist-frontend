"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { selectIsAuthenticated, selectIsLoading } from "@/states/features/slices/auth/authSlice"

interface RequireGuestProps {
  children: React.ReactNode
}

export default function RequireGuest({ children }: RequireGuestProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Get redirect param if it exists
      const redirect = searchParams.get('redirect')
      // Redirect to the intended page or default to /listing
      router.replace(redirect || '/listing')
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if already authenticated
  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
