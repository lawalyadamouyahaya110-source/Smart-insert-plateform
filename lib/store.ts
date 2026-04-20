import type { User, Job, Application, Notification } from "./types"
import { seedData } from "./data"

const KEYS = {
  users: "smartinsert_users",
  jobs: "smartinsert_jobs",
  applications: "smartinsert_applications",
  notifications: "smartinsert_notifications",
  session: "smartinsert_session",
  initialized: "smartinsert_initialized",
}

function isBrowser() {
  return typeof window !== "undefined"
}

function shouldSeedDemoData() {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === "true"
}

// Initialize store with seed data on first load
export function initializeStore() {
  if (!isBrowser()) return
  if (!shouldSeedDemoData()) return
  if (localStorage.getItem(KEYS.initialized)) return

  localStorage.setItem(KEYS.users, JSON.stringify(seedData.users))
  localStorage.setItem(KEYS.jobs, JSON.stringify(seedData.jobs))
  localStorage.setItem(KEYS.applications, JSON.stringify([]))
  localStorage.setItem(KEYS.notifications, JSON.stringify(seedData.notifications))
  localStorage.setItem(KEYS.initialized, "true")
}

// Generic CRUD helpers
function getCollection<T>(key: string): T[] {
  if (!isBrowser()) return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function setCollection<T>(key: string, data: T[]) {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(data))
}

// Users
export function getUsers(): User[] {
  return getCollection<User>(KEYS.users)
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function addUser(user: User) {
  const users = getUsers()
  users.push(user)
  setCollection(KEYS.users, users)
}

export function upsertUser(user: User) {
  const users = getUsers()
  const index = users.findIndex((existing) => existing.id === user.id || existing.email.toLowerCase() === user.email.toLowerCase())
  if (index === -1) {
    users.push(user)
  } else {
    users[index] = { ...users[index], ...user }
  }
  setCollection(KEYS.users, users)
}

// Jobs
export function getJobs(): Job[] {
  return getCollection<Job>(KEYS.jobs)
}

export function getApprovedJobs(): Job[] {
  return getJobs().filter((j) => j.status === "approuve")
}

export function getJobsByEntreprise(entrepriseId: string): Job[] {
  return getJobs().filter((j) => j.entrepriseId === entrepriseId)
}

export function getJobById(id: string): Job | undefined {
  return getJobs().find((j) => j.id === id)
}

export function addJob(job: Job) {
  const jobs = getJobs()
  jobs.push(job)
  setCollection(KEYS.jobs, jobs)
}

export function updateJobStatus(jobId: string, status: Job["status"]) {
  const jobs = getJobs()
  const index = jobs.findIndex((j) => j.id === jobId)
  if (index !== -1) {
    jobs[index].status = status
    setCollection(KEYS.jobs, jobs)
  }
}

// Applications
export function getApplications(): Application[] {
  return getCollection<Application>(KEYS.applications)
}

export function getApplicationsByCandidat(candidatId: string): Application[] {
  return getApplications().filter((a) => a.candidatId === candidatId)
}

export function getApplicationsByJob(jobId: string): Application[] {
  return getApplications().filter((a) => a.jobId === jobId)
}

export function addApplication(application: Application) {
  const applications = getApplications()
  applications.push(application)
  setCollection(KEYS.applications, applications)
}

export function hasApplied(candidatId: string, jobId: string): boolean {
  return getApplications().some(
    (a) => a.candidatId === candidatId && a.jobId === jobId
  )
}

// Notifications
export function getNotifications(): Notification[] {
  return getCollection<Notification>(KEYS.notifications)
}

export function getNotificationsByUser(userId: string): Notification[] {
  return getNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadCount(userId: string): number {
  return getNotificationsByUser(userId).filter((n) => !n.read).length
}

export function addNotification(notification: Notification) {
  const notifications = getNotifications()
  notifications.push(notification)
  setCollection(KEYS.notifications, notifications)
}

export function markNotificationRead(notificationId: string) {
  const notifications = getNotifications()
  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index !== -1) {
    notifications[index].read = true
    setCollection(KEYS.notifications, notifications)
  }
}

export function markAllNotificationsRead(userId: string) {
  const notifications = getNotifications()
  notifications.forEach((n) => {
    if (n.userId === userId) n.read = true
  })
  setCollection(KEYS.notifications, notifications)
}

// Session
export function setSession(userId: string) {
  if (!isBrowser()) return
  localStorage.setItem(KEYS.session, userId)
}

export function getSession(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(KEYS.session)
}

export function clearSession() {
  if (!isBrowser()) return
  localStorage.removeItem(KEYS.session)
}

// Stats
export function getStats() {
  const jobs = getJobs()
  const users = getUsers()
  const applications = getApplications()
  return {
    totalJobs: jobs.length,
    approvedJobs: jobs.filter((j) => j.status === "approuve").length,
    pendingJobs: jobs.filter((j) => j.status === "en_attente").length,
    refusedJobs: jobs.filter((j) => j.status === "refuse").length,
    totalCandidats: users.filter((u) => u.role === "candidat").length,
    totalEntreprises: users.filter((u) => u.role === "entreprise").length,
    totalApplications: applications.length,
  }
}
