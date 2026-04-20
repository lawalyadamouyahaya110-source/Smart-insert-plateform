"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import type { User } from "@/lib/types"

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export function DashboardSidebar({
  user,
  links,
  title,
}: {
  user: User
  links: SidebarLink[]
  title: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95">
      {/* Brand */}
      <div className="border-b border-sidebar-border/80 p-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-secondary shadow-lg shadow-sidebar-primary/30 transition-transform group-hover:scale-105">
            <Briefcase className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            Smart <span className="text-sidebar-primary">Insert</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="border-b border-sidebar-border/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="mt-1 truncate text-sm font-semibold text-sidebar-foreground">{user.nom}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-sidebar-primary to-secondary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/75 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {link.icon}
                    {link.label}
                  </span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-sidebar-primary-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border/80 p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">
            Smart <span className="text-primary">Insert</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-border bg-card/80 p-2 text-foreground"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}
