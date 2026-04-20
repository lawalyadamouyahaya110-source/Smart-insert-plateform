"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import type { Language } from "@/lib/i18n"

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage()

  const set = (lang: Language) => setLanguage(lang)

  return (
    <div className="inline-flex items-center rounded-xl border border-border/80 bg-card/80 p-1">
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant={language === "fr" ? "default" : "ghost"}
        className={compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-xs"}
        onClick={() => set("fr")}
      >
        {t("lang_fr")}
      </Button>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        variant={language === "en" ? "default" : "ghost"}
        className={compact ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-xs"}
        onClick={() => set("en")}
      >
        {t("lang_en")}
      </Button>
    </div>
  )
}
