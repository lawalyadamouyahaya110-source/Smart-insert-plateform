"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getCurrentUser } from "@/lib/auth"
import { LayoutDashboard, Briefcase, FileText, Bell, GraduationCap, Users, BookOpen, Handshake } from "lucide-react"
import { useEffect, useState } from "react"
import type { User } from "@/lib/types"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [unread, setUnread] = useState(0)
  const displayName = user ? `${user.prenom ? `${user.prenom} ` : ""}${user.nom}`.trim() : ""

  useEffect(() => {
    const load = async () => {
      const u = getCurrentUser()
      setUser(u)
      if (!u) return
      try {
        const response = await fetch(`/api/notifications/unread-count?userId=${encodeURIComponent(u.id)}`)
        const data = await response.json()
        if (response.ok) setUnread(Number(data.unreadCount || 0))
      } catch {
        setUnread(0)
      }
    }
    void load()
    const interval = setInterval(() => {
      if (document.hidden) return
      void load()
    }, 10000)
    const handleVisibility = () => {
      if (!document.hidden) void load()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return (
    <AuthGuard role="admin">
      <div className="flex min-h-screen">
        {user && (
          <DashboardSidebar
            user={user}
            title="Administration"
            links={[
              {
                href: "/admin",
                label: "Tableau de bord",
                icon: <LayoutDashboard className="h-4 w-4" />,
              },
              {
                href: "/admin/offres",
                label: "Gestion des offres",
                icon: <Briefcase className="h-4 w-4" />,
              },
              {
                href: "/admin/candidatures",
                label: "Candidatures",
                icon: <FileText className="h-4 w-4" />,
              },
              {
                href: "/admin/formations",
                label: "Formations",
                icon: <GraduationCap className="h-4 w-4" />,
              },
              {
                href: "/admin/inscriptions-formations",
                label: "Inscriptions Formations",
                icon: <BookOpen className="h-4 w-4" />,
              },
              {
                href: "/admin/partenaires",
                label: "Entreprises partenaires",
                icon: <Handshake className="h-4 w-4" />,
              },
              {
                href: "/admin/utilisateurs",
                label: "Utilisateurs",
                icon: <Users className="h-4 w-4" />,
              },
              {
                href: "/admin/notifications",
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
