"use client"

import Link from "next/link"
import { Briefcase } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="relative overflow-hidden border-t border-border bg-card/70">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Smart <span className="text-primary">Insert</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("footer_tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/85">{t("footer_navigation")}</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {t("nav_home")}
                </Link>
              </li>
              <li>
                <Link href="/offres" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {t("nav_jobs")}
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {t("nav_login")}
                </Link>
              </li>
              <li>
                <Link
                  href="/smart-insert-consulting"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t("nav_consulting")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground/85">{t("footer_contact")}</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>smartinsert24@gmail.com</li>
              <li>99369051/91764591/86366706</li>
              <li>Bobiel 2eme pompe</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/80 pt-6 text-center text-sm text-muted-foreground">
          {"Smart Insert"} &copy; {new Date().getFullYear()}. {t("footer_rights")}
        </div>
      </div>
    </footer>
  )
}
