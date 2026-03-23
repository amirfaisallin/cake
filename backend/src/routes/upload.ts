import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'

const router = Router()

let cloudinaryConfigured = false

async function ensureCloudinaryConfig(): Promise<boolean> {
  if (cloudinaryConfigured) return true

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  const ready = Boolean(cloudName && apiKey && apiSecret)
  if (!ready) return false

  cloudinary.config({
    cloud_name: cloudName as string,
    api_key: apiKey as string,
    api_secret: apiSecret as string,
  })

  cloudinaryConfigured = true
  return true
}

const upload = multer({ storage: multer.memoryStorage() })

// POST /api/upload (multipart/form-data, field: "file")
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const cloudinaryReady = await ensureCloudinaryConfig()
    if (!cloudinaryReady) {
      return res.status(500).json({ error: 'Cloudinary not configured' })
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const buffer = file.buffer
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.mimetype};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'sweet-delights',
      resource_type: 'auto',
    })

    return res.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Upload failed' })
  }
})

export default router

