"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, Upload, X, ImageIcon } from "lucide-react"
import { SiteLayout } from "@/components/site-layout"

interface CakeType { id: string; label: string; price: number }
interface Size { id: string; label: string; multiplier: number }
interface Flavor { id: string; label: string }
interface DeliveryArea { id: string; name: string; charge: number }

const timeSlots = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM", 
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
]

const defaultCakeTypes: CakeType[] = [
  { id: "birthday", label: "Birthday", price: 800 },
  { id: "wedding", label: "Wedding", price: 2500 },
  { id: "anniversary", label: "Anniversary", price: 1200 },
  { id: "custom", label: "Custom", price: 1000 },
]

const defaultSizes: Size[] = [
  { id: "0.5kg", label: "0.5 kg", multiplier: 0.6 },
  { id: "1kg", label: "1 kg", multiplier: 1 },
  { id: "1.5kg", label: "1.5 kg", multiplier: 1.4 },
  { id: "2kg", label: "2 kg", multiplier: 1.8 },
  { id: "3kg", label: "3 kg+", multiplier: 2.5 },
]

const defaultFlavors: Flavor[] = [
  { id: "chocolate", label: "Chocolate" },
  { id: "vanilla", label: "Vanilla" },
  { id: "red-velvet", label: "Red Velvet" },
  { id: "strawberry", label: "Strawberry" },
  { id: "butterscotch", label: "Butterscotch" },
]

export default function OrderPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [menuLoading, setMenuLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [referenceImage, setReferenceImage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [cakeTypes, setCakeTypes] = useState<CakeType[]>(defaultCakeTypes)
  const [sizes, setSizes] = useState<Size[]>(defaultSizes)
  const [flavors, setFlavors] = useState<Flavor[]>(defaultFlavors)
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([])
  
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    cakeType: "",
    size: "",
    flavor: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryAddress: "",
    deliveryArea: "",
    specialInstructions: "",
  })

  useEffect(() => {
    const fetchMenuData = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const response = await fetch('/api/menu', { signal: controller.signal })
        const data = response.ok ? await response.json() : { success: false }
        if (data.success) {
          if (data.cakeTypes?.length) setCakeTypes(data.cakeTypes)
          if (data.sizes?.length) setSizes(data.sizes)
          if (data.flavors?.length) setFlavors(data.flavors)
          if (data.deliveryAreas?.length) setDeliveryAreas(data.deliveryAreas)
        }
      } catch (error) {
        console.error('Failed to fetch menu data:', error)
      } finally {
        clearTimeout(timeout)
        setMenuLoading(false)
      }
    }
    fetchMenuData()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      if (data.url) setReferenceImage(data.url)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setReferenceImage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const calculatePrice = () => {
    const cakePrice = cakeTypes.find(c => c.id === formData.cakeType)?.price || 0
    const sizeMultiplier = sizes.find(s => s.id === formData.size)?.multiplier || 1
    return Math.round(cakePrice * sizeMultiplier)
  }

  const getDeliveryCharge = () => {
    return deliveryAreas.find(a => a.id === formData.deliveryArea)?.charge || 0
  }

  const getTotalPrice = () => {
    return calculatePrice() + getDeliveryCharge()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const deliveryArea = deliveryAreas.find(a => a.id === formData.deliveryArea)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deliveryArea: deliveryArea?.name || '',
          deliveryCharge: deliveryArea?.charge || 0,
          referenceImage: referenceImage,
          estimatedPrice: calculatePrice(),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setOrderNumber(data.orderNumber)
        setStep(4)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 = formData.cakeType && formData.size && formData.flavor
  const canProceedStep2 = formData.deliveryDate && formData.deliveryTime && formData.deliveryAddress
  const canProceedStep3 = formData.customerName && formData.phone

  if (menuLoading) {
    return (
      <SiteLayout>
        <div className="min-h-screen pt-14 md:pt-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </SiteLayout>
    )
  }

  return (
    <SiteLayout>
      <div className="min-h-screen pt-14 md:pt-16 pb-8">
        <section className="py-6 md:py-10 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 text-center">
            <span className="text-primary font-serif text-[10px] md:text-xs tracking-widest uppercase">Order Online</span>
            <h1 className="font-sans text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1">
              Custom Cake Order
            </h1>
          </div>
        </section>

        <section className="py-4 md:py-8">
          <div className="container mx-auto px-4 max-w-xl">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-colors ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 md:w-12 h-0.5 mx-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Cake Selection */}
            {step === 1 && (
              <Card className="p-4 md:p-6 border-0 shadow-sm">
                <h2 className="font-sans text-base md:text-lg font-semibold mb-4">Select Your Cake</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs md:text-sm font-medium text-muted-foreground">Cake Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {cakeTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({ ...formData, cakeType: type.id })}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.cakeType === type.id
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="block text-xs md:text-sm font-medium">{type.label}</span>
                          <span className="block text-[10px] md:text-xs text-muted-foreground">from ৳{type.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs md:text-sm font-medium text-muted-foreground">Size</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setFormData({ ...formData, size: size.id })}
                          className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                            formData.size === size.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs md:text-sm font-medium text-muted-foreground">Flavor</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {flavors.map((flavor) => (
                        <button
                          key={flavor.id}
                          onClick={() => setFormData({ ...formData, flavor: flavor.id })}
                          className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                            formData.flavor === flavor.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {flavor.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload */}
                  <div>
                    <Label className="text-xs md:text-sm font-medium text-muted-foreground">Reference Image (Optional)</Label>
                    <p className="text-[10px] text-muted-foreground mb-2">Upload a photo of your desired cake design</p>
                    
                    {referenceImage ? (
                      <div className="relative w-28 h-28">
                        <Image src={referenceImage} alt="Reference" fill className="object-cover rounded-lg border" />
                        <button
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                            <p className="text-[10px] text-muted-foreground">Tap to upload</p>
                          </>
                        )}
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>

                  {formData.cakeType && formData.size && (
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-muted-foreground">Estimated Price</span>
                        <span className="text-lg md:text-xl font-bold text-primary">৳{calculatePrice()}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!canProceedStep1}
                    className="w-full rounded-full mt-2 text-sm"
                  >
                    Continue
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Delivery Details */}
            {step === 2 && (
              <Card className="p-4 md:p-6 border-0 shadow-sm">
                <h2 className="font-sans text-base md:text-lg font-semibold mb-4">Delivery Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryDate" className="text-xs md:text-sm font-medium text-muted-foreground">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      className="mt-1.5 text-sm h-10"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs md:text-sm font-medium text-muted-foreground">Delivery Time</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setFormData({ ...formData, deliveryTime: slot })}
                          className={`p-2 rounded-lg border text-xs md:text-sm transition-all ${
                            formData.deliveryTime === slot
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {deliveryAreas.length > 0 && (
                    <div>
                      <Label className="text-xs md:text-sm font-medium text-muted-foreground">Delivery Area</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {deliveryAreas.map((area) => (
                          <button
                            key={area.id}
                            onClick={() => setFormData({ ...formData, deliveryArea: area.id })}
                            className={`p-2 rounded-lg border text-left text-xs md:text-sm transition-all ${
                              formData.deliveryArea === area.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="block font-medium">{area.name}</span>
                            <span className="block text-muted-foreground">৳{area.charge} delivery</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="address" className="text-xs md:text-sm font-medium text-muted-foreground">Full Address</Label>
                    <Textarea
                      id="address"
                      placeholder="House, Road, Area, City"
                      className="mt-1.5 text-sm min-h-[80px]"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full text-sm">
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)} 
                      disabled={!canProceedStep2}
                      className="flex-1 rounded-full text-sm"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <Card className="p-4 md:p-6 border-0 shadow-sm">
                <h2 className="font-sans text-base md:text-lg font-semibold mb-4">Your Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs md:text-sm font-medium text-muted-foreground">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      className="mt-1.5 text-sm h-10"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs md:text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="01XXX-XXXXXX"
                      className="mt-1.5 text-sm h-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs md:text-sm font-medium text-muted-foreground">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1.5 text-sm h-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="text-xs md:text-sm font-medium text-muted-foreground">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Message on cake, allergies, design preferences..."
                      className="mt-1.5 text-sm min-h-[70px]"
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                    <h3 className="text-xs md:text-sm font-semibold">Order Summary</h3>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{cakeTypes.find(c => c.id === formData.cakeType)?.label} - {sizes.find(s => s.id === formData.size)?.label}</p>
                      <p>{flavors.find(f => f.id === formData.flavor)?.label} Flavor</p>
                      <p>{formData.deliveryDate} | {formData.deliveryTime}</p>
                      {formData.deliveryArea && (
                        <p>Delivery to {deliveryAreas.find(a => a.id === formData.deliveryArea)?.name}</p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-border/50 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Cake Price</span>
                        <span>৳{calculatePrice()}</span>
                      </div>
                      {formData.deliveryArea && (
                        <div className="flex justify-between text-xs">
                          <span>Delivery Charge</span>
                          <span>৳{getDeliveryCharge()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-border/50">
                        <span className="text-xs font-medium">Total</span>
                        <span className="text-base md:text-lg font-bold text-primary">৳{getTotalPrice()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full text-sm">
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={!canProceedStep3 || isSubmitting}
                      className="flex-1 rounded-full text-sm"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Place Order'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <Card className="p-6 md:p-8 border-0 shadow-sm text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
                </div>
                <h2 className="font-sans text-lg md:text-xl font-bold text-foreground mb-2">Order Placed!</h2>
                <p className="text-muted-foreground text-xs md:text-sm mb-4">
                  Your order has been received. We will contact you shortly.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Order Number</p>
                  <p className="text-lg md:text-xl font-bold text-primary">{orderNumber}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Save this number for tracking your order.
                </p>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => window.location.href = `/track?order=${orderNumber}`}
                    variant="outline"
                    className="w-full rounded-full text-sm"
                  >
                    Track Order
                  </Button>
                  <Button 
                    onClick={() => window.open(`https://wa.me/8801738205144?text=Hi! My order number is ${orderNumber}`, '_blank')}
                    className="w-full rounded-full bg-[#25D366] hover:bg-[#25D366]/90 text-white text-sm"
                  >
                    Contact via WhatsApp
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}
