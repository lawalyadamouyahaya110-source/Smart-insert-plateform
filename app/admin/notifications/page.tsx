"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Circle, Briefcase, FileText } from "lucide-react"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

const typeIcons: Record<string, React.ReactNode> = {
  nouvelle_offre: <Briefcase className="h-4 w-4" />,
  nouvelle_candidature: <FileText className="h-4 w-4" />,
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  const loadNotifications = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${encodeURIComponent(id)}`)
      const data = await response.json()
      if (!response.ok) return
      setNotifications(data as Notification[])
    } catch {
      setNotifications([])
    }
  }

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    setUserId(user.id)
    void loadNotifications(user.id)
    const interval = setInterval(() => {
      if (document.hidden) return
      void loadNotifications(user.id)
    }, 10000)
    const handleVisibility = () => {
      if (!document.hidden) void loadNotifications(user.id)
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  const handleMarkRead = async (id: string) => {
    if (!userId) return
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
    await loadNotifications(userId)
  }

  const handleMarkAllRead = async () => {
    if (!userId) return
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    await loadNotifications(userId)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Aucune nouvelle notification"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2 rounded-xl">
            <CheckCheck className="h-4 w-4" />
            Tout marquer lu
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {notifications.map((notif) => {
            const icon = typeIcons[notif.type] || <Bell className="h-4 w-4" />
            const content = (
              <div
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                  notif.read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  notif.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {notif.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleMarkRead(notif.id)
                    }}
                    className="flex-shrink-0 rounded-lg p-1 text-primary hover:bg-primary/10"
                    aria-label="Marquer comme lu"
                  >
                    <Circle className="h-3 w-3 fill-current" />
                  </button>
                )}
              </div>
            )

            if (notif.link) {
              return (
                <Link key={notif.id} href={notif.link} className="block">
                  {content}
                </Link>
              )
            }
            return <div key={notif.id}>{content}</div>
          })}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune notification</h3>
          <p className="mt-1 text-muted-foreground">Vos notifications apparaitront ici</p>
        </div>
      )}
    </div>
  )
}
