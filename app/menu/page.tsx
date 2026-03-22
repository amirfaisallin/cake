"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteLayout } from "@/components/site-layout"
import { Loader2 } from "lucide-react"

interface Category {
  _id: string
  name: string
  slug: string
}

interface FoodItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  categoryName: string
  tags: string[]
}

export default function MenuPage() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/food')
      const data = await res.json()
      setItems(data.items || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(item => item.categoryId === activeCategory)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-14 md:pt-16">
        {/* Header */}
        <section className="py-6 md:py-10 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 text-center">
            <span className="text-primary font-serif text-[10px] md:text-xs tracking-widest uppercase">Our Collection</span>
            <h1 className="font-sans text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1">Cake Menu</h1>
            <p className="text-muted-foreground font-serif text-xs md:text-sm mt-1 max-w-md mx-auto">
              Fresh homemade cakes for every occasion
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-2.5 md:py-4 border-b border-border sticky top-12 md:top-16 bg-background/95 backdrop-blur-sm z-20">
          <div className="container mx-auto">
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide scroll-smooth" style={{ scrollPaddingLeft: '16px' }}>
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-serif whitespace-nowrap transition-colors shrink-0 ${
                  activeCategory === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-serif whitespace-nowrap transition-colors shrink-0 ${
                    activeCategory === cat._id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {/* Spacer for last item visibility */}
              <div className="shrink-0 w-4" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Items Grid */}
        <section className="py-6 md:py-10">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-sm">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
                {filteredItems.map((item) => (
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
                        <span className="absolute top-1 left-1 md:top-2 md:left-2 bg-foreground/80 text-background text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full">
                          {item.categoryName}
                        </span>
                      )}
                    </div>
                    <div className="p-2 md:p-3">
                      <h3 className="font-sans text-[11px] md:text-sm font-semibold text-foreground leading-tight line-clamp-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-muted-foreground text-[9px] md:text-xs mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-primary font-bold text-sm md:text-base">৳{item.price}</span>
                        <Button 
                          asChild 
                          size="sm" 
                          className="w-full h-7 md:h-8 text-[10px] md:text-xs rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Link href="/order">Order Now</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-8 md:py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-sans text-lg md:text-xl font-bold text-foreground mb-2">Need a Custom Cake?</h2>
            <p className="text-muted-foreground font-serif text-xs md:text-sm mb-4 max-w-md mx-auto">
              We create custom designs for weddings, birthdays, and special events.
            </p>
            <Button asChild className="rounded-full px-5 text-xs md:text-sm h-9 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/order">Request Custom Order</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}
