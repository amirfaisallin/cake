"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const router = (0, express_1.Router)();
let cloudinaryConfigured = false;
async function ensureCloudinaryConfig() {
    if (cloudinaryConfigured)
        return true;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const ready = Boolean(cloudName && apiKey && apiSecret);
    if (!ready)
        return false;
    cloudinary_1.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
    cloudinaryConfigured = true;
    return true;
}
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// POST /api/upload (multipart/form-data, field: "file")
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const cloudinaryReady = await ensureCloudinaryConfig();
        if (!cloudinaryReady) {
            return res.status(500).json({ error: 'Cloudinary not configured' });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const buffer = file.buffer;
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64}`;
        const result = await cloudinary_1.v2.uploader.upload(dataUri, {
            folder: 'sweet-delights',
            resource_type: 'auto',
        });
        return res.json({
            url: result.secure_url,
            publicId: result.public_id,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
});
exports.default = router;
