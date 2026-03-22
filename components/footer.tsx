import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react"

const quickLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/gallery", label: "Gallery" },
  { href: "/delivery", label: "Delivery" },
  { href: "/contact", label: "Contact" },
]

const cakeCategories = [
  "Birthday Cakes",
  "Wedding Cakes",
  "Anniversary Cakes",
  "Custom Cakes",
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-1.5 group mb-3">
              <div className="relative w-8 h-8">
                <Image src="/images/logo.jpg" alt="Tiny Bites" fill className="object-contain rounded-full" />
              </div>
              <span className="font-sans text-sm font-semibold">Tiny Bites</span>
            </Link>
            <p className="text-background/70 font-serif text-xs leading-relaxed mb-4">
              Homemade cakes for your special moments.
            </p>
            <div className="flex gap-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://wa.me/8801700000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-sans text-sm font-semibold mb-3">Links</h3>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-background/70 hover:text-primary font-serif text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm font-semibold mb-3">Cakes</h3>
            <ul className="space-y-1.5">
              {cakeCategories.map((category) => (
                <li key={category}>
                  <Link 
                    href="/menu"
                    className="text-background/70 hover:text-primary font-serif text-xs transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm font-semibold mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-background/70 font-serif text-xs">+880 1700-000-000</p>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-background/70 font-serif text-xs break-all">hello@tinybites.com</p>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-background/70 font-serif text-xs">Gulshan-2, Dhaka</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-4">
          <p className="text-background/50 font-serif text-xs text-center">
            © {new Date().getFullYear()} Tiny Bites by Ruthbah. Made with love in Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  )
}
