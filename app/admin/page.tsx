"use client"

import { useEffect, useState } from "react"
import { Briefcase, Users, Building2, FileText, Clock, CheckCircle, XCircle } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    approvedJobs: 0,
    pendingJobs: 0,
    refusedJobs: 0,
    totalCandidats: 0,
    totalEntreprises: 0,
    totalApplications: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        if (!response.ok) return
        setStats(data)
      } catch {
        // Keep last known values on transient network/db errors.
      }
    }

    void loadStats()
    const interval = setInterval(() => {
      if (document.hidden) return
      void loadStats()
    }, 10000)
    const handleVisibility = () => {
      if (!document.hidden) void loadStats()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  const cards = [
    {
      label: "Total Offres",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Offres approuvees",
      value: stats.approvedJobs,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "En attente",
      value: stats.pendingJobs,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Refusees",
      value: stats.refusedJobs,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Candidats",
      value: stats.totalCandidats,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Entreprises",
      value: stats.totalEntreprises,
      icon: Building2,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Candidatures",
      value: stats.totalApplications,
      icon: FileText,
      color: "bg-teal-100 text-teal-600",
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-1 text-muted-foreground">
          Vue d{"'"}ensemble de la plateforme Smart Insert
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold text-card-foreground">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
