"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { selectIsAuthenticated, selectIsLoading } from "@/states/features/slices/auth/authSlice"

interface RequireGuestProps {
  children: React.ReactNode
}

export default function RequireGuest({ children }: RequireGuestProps) {
  const router = useRouter()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/listing")
    }
  }, [isAuthenticated, isLoading, router])

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
