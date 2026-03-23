"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const fallbackStore_1 = require("../lib/fallbackStore");
const router = (0, express_1.Router)();
// GET /api/settings
router.get('/', async (_req, res) => {
    try {
        const { db } = await (0, db_1.connectToDatabase)();
        const settings = await db.collection('settings').find({}).toArray();
        const settingsObj = {};
        settings.forEach((s) => {
            settingsObj[s.key] = s.value;
        });
        res.json({ success: true, settings: settingsObj });
    }
    catch (error) {
        console.error('Settings fetch error:', error);
        const settings = await (0, fallbackStore_1.fallbackGetSettings)();
        res.json({ success: true, settings });
    }
});
exports.default = router;
