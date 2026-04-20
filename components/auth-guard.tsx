"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getRedirectPath, refreshCurrentUser } from "@/lib/auth"
import type { UserRole } from "@/lib/types"
import { initializeStore } from "@/lib/store"

export function AuthGuard({
  role,
  children,
}: {
  role: UserRole
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const validate = async () => {
      initializeStore()
      const localUser = getCurrentUser()
      const user = localUser || (await refreshCurrentUser())

      if (!user) {
        router.replace("/connexion")
        return
      }

      if (user.role !== role) {
        router.replace(getRedirectPath(user.role))
        return
      }

      setAuthorized(true)
    }

    void validate()
  }, [role, router])

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
