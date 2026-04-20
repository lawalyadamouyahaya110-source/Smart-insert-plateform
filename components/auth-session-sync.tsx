"use client"

import { useEffect } from "react"
import { refreshCurrentUser } from "@/lib/auth"

export function AuthSessionSync() {
  useEffect(() => {
    void refreshCurrentUser()
  }, [])

  return null
}
