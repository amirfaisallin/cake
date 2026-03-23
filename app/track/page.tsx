"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SiteLayout } from "@/components/site-layout"
import { Search, Package, Clock, CheckCircle2, Truck, XCircle, Loader2, Phone, MapPin, Calendar, Cake } from "lucide-react"

interface OrderData {
  orderNumber: string
  customerName: string
  phone: string
  cakeType: string
  size: string
  flavor: string
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: string
  deliveryArea?: string
  deliveryCharge?: number
  estimatedPrice: number
  status: string
  createdAt: string
  updatedAt: string
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Cake },
  { key: "ready", label: "Ready", icon: Package },
  { key: "delivered", label: "Delivered", icon: Truck },
]

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50",
  confirmed: "text-blue-600 bg-blue-50",
  preparing: "text-purple-600 bg-purple-50",
  ready: "text-cyan-600 bg-cyan-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrack = async () => {
    if (!orderNumber.trim()) {
      setError("Please enter your order number")
      return
    }
    
    setLoading(true)
    setError("")
    setOrder(null)
    
    try {
      const response = await fetch(`/api/orders/track?orderNumber=${orderNumber.trim().toUpperCase()}`)
      const data = await response.json()
      
      if (data.success && data.order) {
        setOrder(data.order)
      } else {
        setError("Order not found. Please check your order number.")
      }
    } catch {
      setError("Failed to track order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIndex = (status: string) => {
    if (status === "cancelled") return -1
    return statusSteps.findIndex(s => s.key === status)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <SiteLayout>
      <div className="min-h-screen pt-14 md:pt-16 pb-8">
        <section className="py-6 md:py-10 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 text-center">
            <span className="text-primary font-serif text-[10px] md:text-xs tracking-widest uppercase">Order Status</span>
            <h1 className="font-sans text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-1">
              Track Your Order
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-2 max-w-md mx-auto">
              Enter your order number to check the current status of your cake order
            </p>
          </div>
        </section>

        <section className="py-4 md:py-8">
          <div className="container mx-auto px-4 max-w-lg">
            <Card className="p-4 md:p-6 border-0 shadow-sm">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderNumber" className="text-xs md:text-sm font-medium text-muted-foreground">Order Number</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="orderNumber"
                      placeholder="e.g. TB260315001"
                      className="text-sm h-10 uppercase"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    />
                    <Button 
                      onClick={handleTrack} 
                      disabled={loading}
                      className="px-4 h-10"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
              </div>
            </Card>

            {order && (
              <div className="mt-4 space-y-4">
                {/* Status Progress */}
                <Card className="p-4 md:p-6 border-0 shadow-sm">
                  <h2 className="font-sans text-sm md:text-base font-semibold mb-4">Order Status</h2>
                  
                  {order.status === "cancelled" ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                      <XCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="font-semibold text-red-700 text-sm">Order Cancelled</p>
                        <p className="text-red-600 text-xs">This order has been cancelled</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {statusSteps.map((step, index) => {
                        const currentIndex = getStatusIndex(order.status)
                        const isCompleted = index <= currentIndex
                        const isCurrent = index === currentIndex
                        const Icon = step.icon
                        
                        return (
                          <div key={step.key} className="flex items-start gap-3 relative">
                            {index < statusSteps.length - 1 && (
                              <div className={`absolute left-4 top-8 w-0.5 h-8 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className={`pb-6 ${isCurrent ? 'font-medium' : ''}`}>
                              <p className={`text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-primary mt-0.5">Current status</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>

                {/* Order Details */}
                <Card className="p-4 md:p-6 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-sans text-sm md:text-base font-semibold">Order Details</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Order:</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Cake className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Cake:</span>
                      <span>{order.cakeType} - {order.flavor} ({order.size})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Delivery:</span>
                      <span>{order.deliveryDate} at {order.deliveryTime}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="flex-1">{order.deliveryAddress}</span>
                    </div>

                    <div className="pt-3 border-t space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cake Price</span>
                        <span>৳{order.estimatedPrice}</span>
                      </div>
                      {order.deliveryCharge !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Delivery ({order.deliveryArea})</span>
                          <span>৳{order.deliveryCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold pt-1.5 border-t">
                        <span>Total</span>
                        <span className="text-primary">৳{order.estimatedPrice + (order.deliveryCharge || 0)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Contact */}
                <Card className="p-4 border-0 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Need help?</p>
                      <p className="text-xs text-muted-foreground">Contact us for any questions</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => window.open(`https://wa.me/8801738205144?text=Hi! I have a question about my order ${order.orderNumber}`, '_blank')}
                      className="bg-[#25D366] hover:bg-[#25D366]/90 text-white text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}
