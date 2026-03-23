"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Clock, Truck, Award, Loader2 } from "lucide-react"
import { SiteLayout } from "@/components/site-layout"

interface FoodItem {
  _id: string
  name: string
  price: number
  image: string
  categoryName: string
}

const features = [
  { icon: Award, title: "Premium Quality", desc: "Finest ingredients" },
  { icon: Clock, title: "Fresh Daily", desc: "Made to order" },
  { icon: Truck, title: "Fast Delivery", desc: "Same day service" },
]

const testimonials = [
  { name: "Fatima R.", text: "The best birthday cake I ever ordered! Everyone loved it.", rating: 5 },
  { name: "Ahmed K.", text: "Amazing wedding cake. Beautiful design and delicious taste.", rating: 5 },
  { name: "Sarah M.", text: "Quick delivery and the cake was so fresh. Highly recommend!", rating: 5 },
]

export default function HomePage() {
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([])
  const [heroImage, setHeroImage] = useState("/images/hero-cake.jpg")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const [foodRes, settingsRes] = await Promise.all([
          fetch('/api/food?featured=true', { signal: controller.signal }),
          fetch('/api/settings', { signal: controller.signal })
        ])
        const foodData = foodRes.ok ? await foodRes.json() : { items: [] }
        const settingsData = settingsRes.ok ? await settingsRes.json() : { settings: {} }
        
        setFeaturedItems(foodData.items?.slice(0, 4) || [])
        if (settingsData.settings?.hero_image) {
          setHeroImage(settingsData.settings.hero_image)
        }
      } catch (error) {
        console.error('Failed to fetch:', error)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <SiteLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative min-h-[80vh] md:min-h-screen flex items-center pt-14 md:pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-background to-muted/20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="order-2 md:order-1 text-center md:text-left">
                <span className="inline-block text-primary font-serif text-[10px] md:text-xs tracking-widest uppercase mb-2">
                  Tiny Bites by Ruthbah
                </span>
                <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-3 text-balance">
                  Delicious Homemade Treats
                </h1>
                <p className="text-muted-foreground font-serif text-xs md:text-sm leading-relaxed mb-4 max-w-md mx-auto md:mx-0">
                  Premium homemade cakes and desserts crafted with love for your special moments.
                </p>
                <div className="flex flex-col xs:flex-row gap-2.5 justify-center md:justify-start">
                  <Button asChild size="sm" className="rounded-full px-5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm">
                    <Link href="/order">Order Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full px-5 h-9 border-primary/30 text-foreground hover:bg-primary/10 text-xs md:text-sm">
                    <Link href="/menu">View Menu</Link>
                  </Button>
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72">
                  <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl" />
                  <Image
                    src={heroImage}
                    alt="Tiny Bites - Delicious Cakes"
                    fill
                    className="object-cover rounded-full shadow-2xl ring-4 ring-primary/20"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-8 md:py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-9 h-9 md:w-11 md:h-11 mx-auto mb-1.5 md:mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <h3 className="font-sans text-[11px] md:text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground font-serif text-[9px] md:text-xs">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Cakes */}
        <section className="py-8 md:py-14">
          <div className="container mx-auto px-4">
            <div className="text-center mb-5 md:mb-8">
              <span className="text-primary font-serif text-[10px] md:text-xs tracking-widest uppercase">Our Best Sellers</span>
              <h2 className="font-sans text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1">Featured Cakes</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">Featured cakes coming soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-4">
                {featuredItems.map((item) => (
                  <Card key={item._id} className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all bg-card">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-[10px]">
                          No image
                        </div>
                      )}
                      {item.categoryName && (
                        <span className="absolute top-1 left-1 md:top-2 md:left-2 bg-primary/90 text-primary-foreground text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full">
                          {item.categoryName}
                        </span>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <h3 className="font-sans text-[11px] md:text-sm font-semibold text-foreground leading-tight line-clamp-1">{item.name}</h3>
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        <span className="text-primary font-bold text-sm md:text-base">৳{item.price}</span>
                        <Button asChild size="sm" className="w-full h-7 md:h-8 text-[10px] md:text-xs rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/order">Order Now</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="text-center mt-5 md:mt-8">
              <Button asChild variant="outline" className="rounded-full px-5 h-9 text-xs md:text-sm border-primary/30 hover:bg-primary/10">
                <Link href="/menu">View All Cakes</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-8 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-5 md:mb-8">
              <span className="text-primary font-serif text-[10px] md:text-xs tracking-widest uppercase">Testimonials</span>
              <h2 className="font-sans text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1">What Our Customers Say</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {testimonials.map((t) => (
                <Card key={t.name} className="p-3 md:p-4 border-0 shadow-sm bg-card">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground/80 font-serif text-[11px] md:text-xs leading-relaxed mb-2">{t.text}</p>
                  <p className="font-sans text-xs font-semibold text-foreground">{t.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 md:py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-sans text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3">Ready to Order?</h2>
            <p className="font-serif text-xs md:text-sm opacity-90 mb-4 max-w-md mx-auto">
              Contact Tiny Bites on WhatsApp for custom orders and same-day delivery.
            </p>
            <Button asChild size="sm" className="rounded-full px-5 h-9 bg-card text-foreground hover:bg-card/90 text-xs md:text-sm">
              <Link href="/order">Place Your Order</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}
