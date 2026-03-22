import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Truck, Clock, MapPin, CreditCard, Phone } from "lucide-react"
import { SiteLayout } from "@/components/site-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Delivery Info | Sweet Delights",
  description: "Delivery information and pricing for Sweet Delights cakes in Dhaka, Bangladesh.",
}

const deliveryZones = [
  { area: "Gulshan, Banani, Baridhara", price: "৳100", time: "1-2 hours" },
  { area: "Dhanmondi, Mohammadpur", price: "৳150", time: "2-3 hours" },
  { area: "Uttara, Mirpur", price: "৳200", time: "3-4 hours" },
  { area: "Other Dhaka Areas", price: "৳250+", time: "Same day" },
]

const policies = [
  { icon: Clock, title: "Order Time", desc: "Order 24 hours ahead for best results. Same day available for select items." },
  { icon: Truck, title: "Delivery", desc: "Free delivery on orders above ৳3,000 within Gulshan area." },
  { icon: CreditCard, title: "Payment", desc: "Cash on delivery or bKash/Nagad payment accepted." },
  { icon: Phone, title: "Changes", desc: "Contact us 12 hours before for any order modifications." },
]

export default function DeliveryPage() {
  return (
    <SiteLayout>
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary font-serif text-xs tracking-wider">DELIVERY INFO</span>
          <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 mb-2">Delivery & Pricing</h1>
          <p className="text-muted-foreground font-serif text-sm max-w-md mx-auto">
            We deliver across Dhaka city
          </p>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-sans text-lg md:text-xl font-semibold text-foreground mb-4 text-center">Delivery Zones</h2>
          <div className="space-y-3">
            {deliveryZones.map((zone) => (
              <Card key={zone.area} className="p-3 md:p-4 border-0 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">{zone.area}</p>
                    <p className="text-muted-foreground text-xs font-serif">{zone.time}</p>
                  </div>
                </div>
                <span className="text-primary font-semibold text-sm">{zone.price}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-sans text-lg md:text-xl font-semibold text-foreground mb-4 text-center">Order Policies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {policies.map((policy) => (
              <Card key={policy.title} className="p-4 border-0 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <policy.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-medium text-foreground mb-1">{policy.title}</h3>
                    <p className="text-muted-foreground text-xs font-serif leading-relaxed">{policy.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sans text-xl md:text-2xl font-bold text-foreground mb-2">Ready to Order?</h2>
          <p className="text-muted-foreground font-serif text-sm mb-4 max-w-md mx-auto">
            Place your order now for fresh delivery
          </p>
          <Button asChild className="rounded-full px-6 text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/order">Place Order</Link>
          </Button>
        </div>
      </section>
    </div>
    </SiteLayout>
  )
}
