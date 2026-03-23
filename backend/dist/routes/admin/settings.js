"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../lib/db");
const fallbackStore_1 = require("../../lib/fallbackStore");
const router = (0, express_1.Router)();
// GET /api/admin/settings
router.get('/', async (_req, res) => {
    try {
        const { db } = await (0, db_1.connectToDatabase)();
        const settings = await db.collection('settings').find({}).toArray();
        const settingsObj = {};
        settings.forEach((s) => {
            settingsObj[s.key] = s.value;
        });
        return res.json({ success: true, settings: settingsObj });
    }
    catch (error) {
        console.error('Settings fetch error:', error);
        const settings = await (0, fallbackStore_1.fallbackGetSettings)();
        return res.json({ success: true, settings });
    }
});
// POST /api/admin/settings
router.post('/', async (req, res) => {
    try {
        const body = req.body || {};
        const { db } = await (0, db_1.connectToDatabase)();
        const { key, value } = body;
        if (!key) {
            return res.status(400).json({ success: false, error: 'Key is required' });
        }
        await db.collection('settings').updateOne({ key }, {
            $set: {
                key,
                value: value || '',
                updatedAt: new Date(),
            },
        }, { upsert: true });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Settings update error:', error);
        const body = req.body || {};
        const { key, value } = body;
        if (!key)
            return res.status(400).json({ success: false, error: 'Key is required' });
        await (0, fallbackStore_1.fallbackUpsertSetting)(String(key), String(value || ''));
        return res.json({ success: true });
    }
});
exports.default = router;
