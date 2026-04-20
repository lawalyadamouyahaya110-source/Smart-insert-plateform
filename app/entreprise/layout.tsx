"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getCurrentUser } from "@/lib/auth"
import { getUnreadCount } from "@/lib/store"
import { LayoutDashboard, PlusCircle, Bell } from "lucide-react"
import { useEffect, useState } from "react"
import type { User } from "@/lib/types"

export default function EntrepriseLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [unread, setUnread] = useState(0)
  const displayName = user ? user.nomEntreprise || user.nom : ""

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    if (u) setUnread(getUnreadCount(u.id))
  }, [])

  return (
    <AuthGuard role="entreprise">
      <div className="flex min-h-screen">
        {user && (
          <DashboardSidebar
            user={user}
            title="Espace Entreprise"
            links={[
              {
                href: "/entreprise",
                label: "Mes Offres",
                icon: <LayoutDashboard className="h-4 w-4" />,
              },
              {
                href: "/entreprise/publier",
                label: "Publier une offre",
                icon: <PlusCircle className="h-4 w-4" />,
              },
              {
                href: "/entreprise/notifications",
                label: "Notifications",
                icon: <Bell className="h-4 w-4" />,
                badge: unread,
              },
            ]}
          />
        )}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="border-b border-border/80 bg-card/70 px-6 py-4 backdrop-blur-sm lg:px-8">
            <div className="mb-2 h-0.5 w-28 rounded-full bg-gradient-to-r from-primary/70 to-secondary/70" />
            <p className="text-sm text-muted-foreground">
              Bonjour <span className="font-semibold text-foreground">{displayName || "Utilisateur"}</span>
            </p>
          </div>
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
