import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Phone, Mail, MapPin, Clock, MessageCircle, Globe, Camera } from "lucide-react"
import { SiteLayout } from "@/components/site-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Sweet Delights",
  description: "Contact Sweet Delights for custom cake orders, inquiries, and support.",
}

const contactMethods = [
  { icon: Phone, title: "Phone", value: "01738205144", href: "tel:01738205144", color: "text-primary" },
  { icon: MessageCircle, title: "WhatsApp", value: "01738205144", href: "https://wa.me/8801738205144", color: "text-[#25D366]" },
  { icon: Mail, title: "Email", value: "hello@sweetdelights.com", href: "mailto:hello@sweetdelights.com", color: "text-primary" },
]

const socialLinks = [
  { icon: Globe, name: "Facebook", href: "https://www.facebook.com/thecakecell", color: "bg-[#1877F2]" },
  { icon: Camera, name: "Instagram", href: "https://www.facebook.com/thecakecell", color: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
  { icon: MessageCircle, name: "Messenger", href: "https://www.facebook.com/thecakecell", color: "bg-[#0084FF]" },
]

export default function ContactPage() {
  return (
    <SiteLayout>
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary font-serif text-xs tracking-wider">GET IN TOUCH</span>
          <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 mb-2">Contact Us</h1>
          <p className="text-muted-foreground font-serif text-sm max-w-md mx-auto">
            We would love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
            {contactMethods.map((method) => (
              <Card key={method.title} className="p-4 border-0 shadow-sm text-center">
                <method.icon className={`w-5 h-5 mx-auto mb-2 ${method.color}`} />
                <p className="font-sans text-xs font-medium text-foreground mb-1">{method.title}</p>
                <a href={method.href} className={`${method.color} text-xs font-serif hover:underline`}>
                  {method.value}
                </a>
              </Card>
            ))}
          </div>

          {/* Location */}
          <Card className="p-4 md:p-6 border-0 shadow-sm mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium text-foreground mb-1">Our Location</h3>
                <p className="text-muted-foreground text-xs font-serif">
                  Opposite Keramat Ullah Market,<br />
                  Ulipur Moddho Bazar, Ulipur.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-medium text-foreground mb-1">Working Hours</h3>
                <p className="text-muted-foreground text-xs font-serif">
                  Saturday - Thursday: 9 AM - 9 PM<br />
                  Friday: 2 PM - 9 PM
                </p>
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <div className="text-center">
            <h3 className="font-sans text-sm font-medium text-foreground mb-3">Follow Us</h3>
            <div className="flex justify-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full ${social.color} flex items-center justify-center text-white hover:scale-105 transition-transform`}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sans text-xl md:text-2xl font-bold mb-2">Ready to Order?</h2>
          <p className="font-serif text-sm opacity-90 mb-4 max-w-md mx-auto">
            Contact us on WhatsApp for quick ordering
          </p>
          <Button asChild size="default" className="rounded-full px-6 bg-card text-foreground hover:bg-card/90 text-sm">
            <Link href="/order">Order Now</Link>
          </Button>
        </div>
      </section>
    </div>
    </SiteLayout>
  )
}
