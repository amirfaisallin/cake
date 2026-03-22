import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteLayout } from "@/components/site-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery | Sweet Delights",
  description: "Browse our cake gallery - beautiful cakes for birthdays, weddings, and special occasions.",
}

const galleryImages = [
  { id: 1, src: "/images/hero-cake.jpg", alt: "Elegant wedding cake", category: "Wedding" },
  { id: 2, src: "/images/chocolate-cake.jpg", alt: "Chocolate birthday cake", category: "Birthday" },
  { id: 3, src: "/images/red-velvet-cake.jpg", alt: "Red velvet cake", category: "Special" },
  { id: 4, src: "/images/strawberry-cake.jpg", alt: "Strawberry cake", category: "Birthday" },
  { id: 5, src: "/images/vanilla-cake.jpg", alt: "Vanilla celebration cake", category: "Birthday" },
  { id: 6, src: "/images/wedding-cake.jpg", alt: "White wedding cake", category: "Wedding" },
]

export default function GalleryPage() {
  return (
    <SiteLayout>
    <div className="min-h-screen pt-16 md:pt-20">
      {/* Header */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary font-serif text-xs tracking-wider">OUR CREATIONS</span>
          <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 mb-2">Cake Gallery</h1>
          <p className="text-muted-foreground font-serif text-sm max-w-md mx-auto">
            Browse our beautiful cake creations
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-end justify-start p-3 opacity-0 group-hover:opacity-100">
                  <span className="bg-card/90 text-foreground text-xs px-2 py-1 rounded-full font-serif">
                    {image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-sans text-xl md:text-2xl font-bold text-foreground mb-2">Like What You See?</h2>
          <p className="text-muted-foreground font-serif text-sm mb-4 max-w-md mx-auto">
            Order your custom cake today
          </p>
          <Button asChild className="rounded-full px-6 text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/order">Order Now</Link>
          </Button>
        </div>
      </section>
    </div>
    </SiteLayout>
  )
}
