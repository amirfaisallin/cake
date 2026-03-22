"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/track", label: "Track" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-md py-2 md:py-3"
          : "bg-transparent py-3 md:py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 group">
            <div className="relative w-9 h-9 md:w-10 md:h-10 transition-transform group-hover:scale-105">
              <Image src="/images/logo.jpg" alt="Tiny Bites" fill className="object-contain rounded-full" />
            </div>
            <span className="font-sans text-sm md:text-base font-semibold tracking-tight text-foreground">
              Tiny Bites
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary font-serif text-sm transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Button asChild size="sm" className="rounded-full px-4 text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/order">Order Now</Link>
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-80 opacity-100 mt-3" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-card rounded-xl shadow-lg p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-foreground/80 hover:text-primary font-serif text-sm py-2 border-b border-border/30 last:border-0 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="w-full rounded-full mt-3 text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/order" onClick={() => setIsOpen(false)}>Order Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
