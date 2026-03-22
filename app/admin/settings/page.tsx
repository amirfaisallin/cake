"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Save, ImageIcon, X } from "lucide-react"

export default function AdminSettingsPage() {
  const [heroImage, setHeroImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        setHeroImage(data.settings.hero_image || '/images/hero-cake.jpg')
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setHeroImage(data.url)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'hero_image', value: heroImage })
      })
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-3">
      {/* Header */}
      <div>
        <h1 className="font-sans text-base md:text-xl font-bold">Site Settings</h1>
        <p className="text-[10px] md:text-xs text-muted-foreground">Manage your website</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs md:text-sm">Hero Image</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* Image Preview */}
          <div className="relative w-full aspect-video sm:aspect-square sm:max-w-[200px] bg-muted rounded-lg overflow-hidden">
            {heroImage ? (
              <Image
                src={heroImage}
                alt="Hero Image"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-[10px]">No image</span>
              </div>
            )}
          </div>
          
          {/* URL Input */}
          <div className="space-y-1">
            <Label className="text-[10px] md:text-xs">Image URL</Label>
            <Input
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="Enter URL or upload"
              className="text-xs h-8"
            />
          </div>
          
          {/* Upload Button */}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-7 text-[10px] md:text-xs"
            >
              {uploading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            
            {heroImage && heroImage !== '/images/hero-cake.jpg' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHeroImage('/images/hero-cake.jpg')}
                className="h-7 text-[10px] md:text-xs text-muted-foreground"
              >
                <X className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
          
          <p className="text-[9px] md:text-[10px] text-muted-foreground">
            Appears in hero section. Recommended: 800x800px
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-9 text-xs md:text-sm">
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5 mr-1.5" />
        )}
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  )
}
