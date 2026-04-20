"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { getNotificationsByUser, markNotificationRead, markAllNotificationsRead } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Circle } from "lucide-react"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export default function CandidatNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const loadNotifications = () => {
    const user = getCurrentUser()
    if (user) {
      setNotifications(getNotificationsByUser(user.id))
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkRead = (id: string) => {
    markNotificationRead(id)
    loadNotifications()
  }

  const handleMarkAllRead = () => {
    const user = getCurrentUser()
    if (user) {
      markAllNotificationsRead(user.id)
      loadNotifications()
    }
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2 rounded-xl"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer lu
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                notif.read
                  ? "border-border bg-card"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                notif.read ? "bg-muted" : "bg-primary/10"
              }`}>
                <Bell className={`h-4 w-4 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
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
                  onClick={() => handleMarkRead(notif.id)}
                  className="flex-shrink-0 rounded-lg p-1 text-primary hover:bg-primary/10"
                  aria-label="Marquer comme lu"
                >
                  <Circle className="h-3 w-3 fill-current" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune notification</h3>
          <p className="mt-1 text-muted-foreground">
            Vos notifications apparaitront ici
          </p>
        </div>
      )}
    </div>
  )
}
