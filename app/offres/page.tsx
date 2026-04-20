"use client"

import { useEffect, useState, useMemo } from "react"
import { Search, Filter, Briefcase } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { JobCard } from "@/components/job-card"
import type { Job, ContractType } from "@/lib/types"

const contractTypes: ContractType[] = ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Interim"]

export default function OffresPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [search, setSearch] = useState("")
  const [contractFilter, setContractFilter] = useState<string>("all")
  const [lieuFilter, setLieuFilter] = useState<string>("all")

  const loadJobs = async () => {
    try {
      const response = await fetch("/api/jobs?status=approuve")
      const data = await response.json()
      if (!response.ok) {
        setJobs([])
        return
      }
      const mapped: Job[] = (data as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id || ""),
        entrepriseId: String(row.companyId || ""),
        entrepriseNom: String(row.entrepriseNom || "Entreprise"),
        titre: String(row.titre || ""),
        description: String(row.description || ""),
        lieu: String(row.lieu || ""),
        typeContrat: String(row.typeContrat || "CDI") as ContractType,
        salaire: row.salaire == null ? undefined : String(row.salaire),
        competences: Array.isArray(row.competences) ? (row.competences as string[]) : [],
        status: String(row.status || "approuve") as Job["status"],
        createdAt: String(row.createdAt || new Date().toISOString()),
      }))
      setJobs(mapped)
    } catch {
      setJobs([])
    }
  }

  useEffect(() => {
    void loadJobs()
  }, [])

  const lieux = useMemo(() => {
    const set = new Set(jobs.map((j) => j.lieu))
    return Array.from(set).sort()
  }, [jobs])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        !search ||
        job.titre.toLowerCase().includes(search.toLowerCase()) ||
        job.entrepriseNom.toLowerCase().includes(search.toLowerCase()) ||
        job.competences.some((c) => c.toLowerCase().includes(search.toLowerCase()))
      const matchContract = contractFilter === "all" || job.typeContrat === contractFilter
      const matchLieu = lieuFilter === "all" || job.lieu === lieuFilter
      return matchSearch && matchContract && matchLieu
    })
  }, [jobs, search, contractFilter, lieuFilter])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-sm md:p-8">
            <span className="inline-flex rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
              Recrutement national
            </span>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Offres d{"'"}emploi</h1>
            <p className="mt-2 text-muted-foreground">
              {filtered.length} offre{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, entreprise, competence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl border-border/80 bg-background/80 pl-9"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:flex sm:items-center">
              <Filter className="hidden h-4 w-4 text-muted-foreground sm:block" />
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-background/80 sm:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {contractTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={lieuFilter} onValueChange={setLieuFilter}>
                <SelectTrigger className="h-11 w-full rounded-xl border-border/80 bg-background/80 sm:w-[160px]">
                  <SelectValue placeholder="Lieu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les lieux</SelectItem>
                  {lieux.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Grid */}
          {filtered.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} onApplied={loadJobs} />
              ))}
            </div>
          ) : (
            <div className="mt-16 rounded-3xl border border-dashed border-border bg-card/70 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune offre trouvee</h3>
              <p className="mt-1 text-muted-foreground">Essayez de modifier vos criteres de recherche</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
