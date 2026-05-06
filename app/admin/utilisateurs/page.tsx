"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

type UserRow = {
  id: string
  email: string
  role: "admin" | "entreprise" | "candidat"
  candidatNom?: string | null
  candidatPrenom?: string | null
  entrepriseNom?: string | null
  entrepriseDescription?: string | null
}

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "entreprise" | "candidat">("all")
  const [editing, setEditing] = useState<UserRow | null>(null)

  const loadUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?role=${roleFilter}`)
      const data = await response.json()
      if (!response.ok) return
      setUsers(data as UserRow[])
    } catch {
      setUsers([])
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [roleFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Erreur lors de la suppression")
      return
    }
    toast.success("Utilisateur supprime")
    await loadUsers()
  }

  const handleSave = async () => {
    if (!editing) return
    const res = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: editing.email,
        role: editing.role,
        nom: editing.candidatNom,
        prenom: editing.candidatPrenom,
        entrepriseNom: editing.entrepriseNom,
        entrepriseDescription: editing.entrepriseDescription,
      }),
    })
    if (!res.ok) {
      toast.error("Erreur lors de la mise a jour")
      return
    }
    toast.success("Utilisateur mis a jour")
    setEditing(null)
    await loadUsers()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="mt-1 text-muted-foreground">Gerer les comptes candidats et entreprises</p>
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <SelectTrigger className="w-full rounded-xl sm:w-48">
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="entreprise">Entreprises</SelectItem>
            <SelectItem value="candidat">Candidats</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="hidden grid-cols-6 gap-3 border-b border-border pb-2 text-xs font-semibold uppercase text-muted-foreground md:grid">
          <div className="col-span-2">Email</div>
          <div>Role</div>
          <div className="col-span-2">Profil</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y divide-border">
          {users.map((u) => (
            <div key={u.id} className="py-4 text-sm">
              <div className="space-y-4 rounded-2xl border border-border/60 bg-background/60 p-4 md:hidden">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                    <div className="mt-1">
                      {editing?.id === u.id ? (
                        <Input
                          value={editing.email}
                          onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                          className="rounded-xl"
                        />
                      ) : (
                        <span className="break-all text-foreground">{u.email}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</p>
                    <div className="mt-1">
                      {editing?.id === u.id ? (
                        <Select
                          value={editing.role}
                          onValueChange={(v) => setEditing({ ...editing, role: v as UserRow["role"] })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="entreprise">entreprise</SelectItem>
                            <SelectItem value="candidat">candidat</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-foreground">{u.role}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profil</p>
                    <div className="mt-1">
                      {editing?.id === u.id ? (
                        <div className="grid gap-2">
                          {editing.role === "candidat" && (
                            <>
                              <Input
                                placeholder="Nom"
                                value={editing.candidatNom || ""}
                                onChange={(e) => setEditing({ ...editing, candidatNom: e.target.value })}
                                className="rounded-xl"
                              />
                              <Input
                                placeholder="Prenom"
                                value={editing.candidatPrenom || ""}
                                onChange={(e) => setEditing({ ...editing, candidatPrenom: e.target.value })}
                                className="rounded-xl"
                              />
                            </>
                          )}
                          {editing.role === "entreprise" && (
                            <>
                              <Input
                                placeholder="Nom entreprise"
                                value={editing.entrepriseNom || ""}
                                onChange={(e) => setEditing({ ...editing, entrepriseNom: e.target.value })}
                                className="rounded-xl"
                              />
                              <Input
                                placeholder="Description"
                                value={editing.entrepriseDescription || ""}
                                onChange={(e) => setEditing({ ...editing, entrepriseDescription: e.target.value })}
                                className="rounded-xl"
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-foreground">
                          {u.role === "candidat" && (
                            <span>{`${u.candidatPrenom || ""} ${u.candidatNom || ""}`.trim() || "-"}</span>
                          )}
                          {u.role === "entreprise" && <span>{u.entrepriseNom || "-"}</span>}
                          {u.role === "admin" && <span>-</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {editing?.id === u.id ? (
                    <>
                      <Button variant="outline" onClick={() => setEditing(null)} className="rounded-xl">
                        Annuler
                      </Button>
                      <Button onClick={handleSave} className="rounded-xl">
                        Enregistrer
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setEditing({ ...u })} className="rounded-xl">
                        Modifier
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(u.id)} className="rounded-xl">
                        Supprimer
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden grid-cols-6 items-center gap-3 md:grid">
                <div className="col-span-2">
                  {editing?.id === u.id ? (
                    <Input
                      value={editing.email}
                      onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                      className="rounded-xl"
                    />
                  ) : (
                    <span>{u.email}</span>
                  )}
                </div>
                <div>
                  {editing?.id === u.id ? (
                    <Select
                      value={editing.role}
                      onValueChange={(v) => setEditing({ ...editing, role: v as UserRow["role"] })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="entreprise">entreprise</SelectItem>
                        <SelectItem value="candidat">candidat</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span>{u.role}</span>
                  )}
                </div>
                <div className="col-span-2">
                  {editing?.id === u.id ? (
                    <div className="grid gap-2">
                      {editing.role === "candidat" && (
                        <>
                          <Input
                            placeholder="Nom"
                            value={editing.candidatNom || ""}
                            onChange={(e) => setEditing({ ...editing, candidatNom: e.target.value })}
                            className="rounded-xl"
                          />
                          <Input
                            placeholder="Prenom"
                            value={editing.candidatPrenom || ""}
                            onChange={(e) => setEditing({ ...editing, candidatPrenom: e.target.value })}
                            className="rounded-xl"
                          />
                        </>
                      )}
                      {editing.role === "entreprise" && (
                        <>
                          <Input
                            placeholder="Nom entreprise"
                            value={editing.entrepriseNom || ""}
                            onChange={(e) => setEditing({ ...editing, entrepriseNom: e.target.value })}
                            className="rounded-xl"
                          />
                          <Input
                            placeholder="Description"
                            value={editing.entrepriseDescription || ""}
                            onChange={(e) => setEditing({ ...editing, entrepriseDescription: e.target.value })}
                            className="rounded-xl"
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <div>
                      {u.role === "candidat" && (
                        <span>{`${u.candidatPrenom || ""} ${u.candidatNom || ""}`.trim() || "-"}</span>
                      )}
                      {u.role === "entreprise" && <span>{u.entrepriseNom || "-"}</span>}
                      {u.role === "admin" && <span>-</span>}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {editing?.id === u.id ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(null)} className="rounded-xl">
                        Annuler
                      </Button>
                      <Button size="sm" onClick={handleSave} className="rounded-xl">
                        Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing({ ...u })} className="rounded-xl">
                        Modifier
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)} className="rounded-xl">
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">Aucun utilisateur</div>
          )}
        </div>
      </div>
    </div>
  )
}
