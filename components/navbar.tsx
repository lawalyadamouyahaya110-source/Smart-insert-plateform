"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X, LogOut, User, Building2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, logout, refreshCurrentUser } from "@/lib/auth"
import type { User as UserType } from "@/lib/types"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserType | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const syncUser = async () => {
      const localUser = getCurrentUser()
      setUser(localUser)
      if (!localUser) {
        const serverUser = await refreshCurrentUser()
        setUser(serverUser)
      }
    }

    void syncUser()
  }, [pathname])

  const handleLogout = () => {
    logout()
    setUser(null)
    window.location.href = "/"
  }

  const getDashboardLink = () => {
    if (!user) return "/connexion"
    switch (user.role) {
      case "candidat": return "/candidat"
      case "entreprise": return "/entreprise"
      case "admin": return "/admin"
    }
  }

  const getRoleIcon = () => {
    if (!user) return null
    switch (user.role) {
      case "candidat": return <User className="h-4 w-4" />
      case "entreprise": return <Building2 className="h-4 w-4" />
      case "admin": return <Shield className="h-4 w-4" />
    }
  }

  const getRoleLabel = () => {
    if (!user) return ""
    switch (user.role) {
      case "candidat": return t("nav_my_space")
      case "entreprise": return t("nav_company_space")
      case "admin": return t("nav_admin")
    }
  }

  const publicLinks = [
    { href: "/", label: t("nav_home") },
    { href: "/offres", label: t("nav_jobs") },
    { href: "/formations", label: t("nav_training") },
    { href: "/smart-insert-consulting", label: t("nav_consulting") },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-2xl">
      <div className="mx-auto h-0.5 max-w-7xl bg-gradient-to-r from-primary/70 via-secondary/60 to-primary/70" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-white shadow-lg shadow-primary/15 transition-transform group-hover:scale-105 lg:h-16 lg:w-16">
            <Image
              src="/1737076354945.jpg"
              alt="Logo Smart Insert"
              fill
              className="object-contain p-1.5"
              sizes="(min-width: 1024px) 64px, 56px"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
            Smart <span className="text-primary">Insert</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 rounded-2xl border border-border/70 bg-card/75 p-1.5 shadow-sm backdrop-blur md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-gradient-to-r from-primary/15 to-secondary/15 text-foreground"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher compact />
          {user ? (
            <>
              <Link href={getDashboardLink()}>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                  {getRoleIcon()}
                  {getRoleLabel()}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {t("nav_logout")}
              </Button>
            </>
          ) : (
            <Link href="/connexion">
              <Button size="sm" className="px-6">
                {t("nav_login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-xl border border-border/70 bg-card/80 p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background/95 px-4 pb-4 pt-2 backdrop-blur md:hidden">
          <div className="flex flex-col gap-1">
            <div className="px-1 pb-2 pt-1">
              <LanguageSwitcher compact />
            </div>
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  pathname === link.href
                    ? "bg-gradient-to-r from-primary/15 to-secondary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {getRoleIcon()}
                  {getRoleLabel()}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav_logout")}
                </button>
              </>
            ) : (
              <Link
                href="/connexion"
                onClick={() => setMobileOpen(false)}
                className="mt-1"
              >
                <Button className="w-full rounded-xl bg-primary text-primary-foreground">
                  {t("nav_login")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
