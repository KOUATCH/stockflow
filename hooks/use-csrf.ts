"use client"

import { useEffect, useState } from "react"

interface CSRFToken {
  token: string | null
  signature: string | null
}

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<CSRFToken>({
    token: null,
    signature: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get CSRF token from cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1]

    if (token) {
      setCsrfToken({ token, signature: null })
    }

    setIsLoading(false)
  }, [])

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {}

    if (csrfToken.token) {
      headers["x-csrf-token"] = csrfToken.token
    }

    return headers
  }

  const refreshToken = async (): Promise<void> => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/csrf-token", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const token = response.headers.get("x-csrf-token")
        const signature = response.headers.get("x-csrf-signature")

        if (token && signature) {
          setCsrfToken({ token, signature })
        }
      }
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    token: csrfToken.token,
    signature: csrfToken.signature,
    getHeaders,
    refreshToken,
    isLoading,
  }
}
