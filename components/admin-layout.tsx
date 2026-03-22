"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { Loader2 } from "lucide-react"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token && pathname !== "/admin") {
      router.push("/admin")
    } else if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated && pathname !== "/admin") {
    return null
  }

  if (pathname === "/admin") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="md:ml-52 pt-12 pb-16 md:pb-0 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
