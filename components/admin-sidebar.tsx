"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Cake, 
  Truck, 
  LogOut,
  Menu,
  X,
  UtensilsCrossed,
  Tags,
  List,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/food-items", label: "Add Item", icon: UtensilsCrossed },
  { href: "/admin/food-list", label: "Food List", icon: List },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/menu", label: "Order Options", icon: Cake },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

const mobileNavItems = [
  { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/food-list", label: "Items", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Category", icon: Tags },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin")
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-12 bg-card border-b z-40 flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          <div className="relative w-7 h-7">
            <Image src="/images/logo.jpg" alt="Tiny Bites" fill className="object-contain rounded-full" />
          </div>
          <span className="font-sans text-xs font-semibold">Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-foreground"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card border-t z-40">
        <div className="flex items-center justify-around h-full">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin/dashboard')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px]">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 w-16 h-full text-muted-foreground"
          >
            <Menu className="w-4 h-4" />
            <span className="text-[9px]">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-foreground/20 z-50"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-64 bg-card shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-12 border-b flex items-center justify-between px-3">
              <span className="font-sans text-sm font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="p-2 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-4 left-2 right-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full text-xs h-9"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-52 bg-card border-r flex-col z-30">
        <div className="h-12 border-b flex items-center px-3 gap-2">
          <div className="relative w-8 h-8">
            <Image src="/images/logo.jpg" alt="Tiny Bites" fill className="object-contain rounded-full" />
          </div>
          <div>
            <p className="font-sans text-xs font-semibold leading-tight">Tiny Bites</p>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="w-full text-xs h-8"
          >
            <LogOut className="w-3 h-3 mr-1.5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
