"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const db_1 = require("../../lib/db");
const fallbackStore_1 = require("../../lib/fallbackStore");
const router = (0, express_1.Router)();
// GET /api/admin/menu
router.get('/', async (_req, res) => {
    try {
        const { db } = await (0, db_1.connectToDatabase)();
        const items = await db.collection('menu_items').find({}).sort({ createdAt: -1 }).toArray();
        return res.json({ success: true, items });
    }
    catch (error) {
        console.error('Error fetching menu items:', error);
        const items = await (0, fallbackStore_1.fallbackGetMenuItems)();
        return res.json({
            success: false,
            items: items.slice().sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1)),
        });
    }
});
// POST /api/admin/menu
router.post('/', async (req, res) => {
    try {
        const body = req.body || {};
        const { db } = await (0, db_1.connectToDatabase)();
        const item = {
            type: body.type,
            name: body.name,
            label: body.label,
            price: body.price || 0,
            multiplier: body.multiplier || 1,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db.collection('menu_items').insertOne(item);
        return res.json({ success: true, id: result.insertedId });
    }
    catch (error) {
        console.error('Error creating menu item:', error);
        const body = req.body || {};
        const next = await (0, fallbackStore_1.fallbackUpsertMenuItem)({
            type: body.type,
            name: body.name,
            label: body.label,
            price: body.price || 0,
            multiplier: body.multiplier || 1,
            active: true,
        });
        return res.json({ success: true, id: next._id });
    }
});
// PATCH /api/admin/menu
router.patch('/', async (req, res) => {
    try {
        const body = req.body || {};
        const { id, ...updates } = body;
        const { db } = await (0, db_1.connectToDatabase)();
        await db
            .collection('menu_items')
            .updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating menu item:', error);
        const body = req.body || {};
        const { id, ...updates } = body;
        if (!id)
            return res.status(400).json({ success: false, error: 'ID required' });
        const current = (await (0, fallbackStore_1.fallbackGetMenuItems)()).find((i) => i._id === String(id));
        if (!current)
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        const next = await (0, fallbackStore_1.fallbackUpsertMenuItem)({
            _id: String(id),
            type: updates.type ?? current.type,
            name: updates.name ?? current.name,
            label: updates.label ?? current.label,
            price: updates.price != null ? Number(updates.price) : current.price,
            multiplier: updates.multiplier != null ? Number(updates.multiplier) : current.multiplier,
            active: updates.active ?? current.active,
        });
        return res.json({ success: true });
    }
});
// DELETE /api/admin/menu?id=...
router.delete('/', async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400).json({ success: false, error: 'ID required' });
        }
        const { db } = await (0, db_1.connectToDatabase)();
        await db.collection('menu_items').deleteOne({ _id: new mongodb_1.ObjectId(String(id)) });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting menu item:', error);
        const id = req.query.id;
        if (!id)
            return res.status(400).json({ success: false, error: 'ID required' });
        const deleted = await (0, fallbackStore_1.fallbackDeleteMenuItem)(String(id));
        if (!deleted)
            return res.status(404).json({ success: false, error: 'Menu item not found' });
        return res.json({ success: true });
    }
});
exports.default = router;
