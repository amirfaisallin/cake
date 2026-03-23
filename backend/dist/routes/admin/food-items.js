"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const db_1 = require("../../lib/db");
const fallbackStore_1 = require("../../lib/fallbackStore");
const router = (0, express_1.Router)();
function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
// GET /api/admin/food-items?category=...&active=true
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const activeOnly = req.query.active === 'true';
        const { db } = await (0, db_1.connectToDatabase)();
        const query = {};
        if (typeof category === 'string' && category)
            query.categoryId = category;
        if (activeOnly)
            query.active = true;
        const items = await db
            .collection('food_items')
            .find(query)
            .sort({ featured: -1, createdAt: -1 })
            .toArray();
        return res.json(items);
    }
    catch (error) {
        console.error('Failed to fetch food items:', error);
        const category = req.query.category;
        const activeOnly = req.query.active === 'true';
        const itemsAll = await (0, fallbackStore_1.fallbackGetFoodItems)();
        let items = itemsAll;
        if (typeof category === 'string' && category) {
            items = items.filter((i) => i.categoryId === category);
        }
        if (activeOnly) {
            items = items.filter((i) => i.active === true);
        }
        items.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.createdAt < a.createdAt ? -1 : 1));
        return res.json(items);
    }
});
// POST /api/admin/food-items
router.post('/', async (req, res) => {
    try {
        const body = req.body || {};
        const { db } = await (0, db_1.connectToDatabase)();
        const slug = slugify(String(body.name || ''));
        let categoryName = '';
        if (body.categoryId) {
            const category = await db.collection('categories').findOne({ _id: new mongodb_1.ObjectId(body.categoryId) });
            categoryName = category?.name || '';
        }
        const item = {
            name: body.name,
            slug,
            description: body.description || '',
            price: Number(body.price) || 0,
            image: body.image || '',
            categoryId: body.categoryId || '',
            categoryName,
            tags: body.tags || [],
            sizes: body.sizes || [],
            active: body.active ?? true,
            featured: body.featured ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await db.collection('food_items').insertOne(item);
        return res.status(201).json({ ...item, _id: result.insertedId });
    }
    catch (error) {
        console.error('Failed to create food item:', error);
        const body = req.body || {};
        const slug = slugify(String(body.name || ''));
        let categoryName = '';
        if (body.categoryId) {
            const cats = await (0, fallbackStore_1.fallbackGetCategories)();
            categoryName = cats.find((c) => c._id === String(body.categoryId))?.name || '';
        }
        const next = await (0, fallbackStore_1.fallbackUpsertFoodItem)({
            name: String(body.name || ''),
            slug,
            description: body.description || '',
            price: Number(body.price) || 0,
            image: body.image || '',
            categoryId: body.categoryId || '',
            categoryName,
            tags: body.tags || [],
            sizes: body.sizes || [],
            active: body.active ?? true,
            featured: body.featured ?? false,
        });
        return res.status(201).json(next);
    }
});
// PATCH /api/admin/food-items
router.patch('/', async (req, res) => {
    try {
        const body = req.body || {};
        const { _id, ...updateData } = body;
        const { db } = await (0, db_1.connectToDatabase)();
        if (updateData.name) {
            updateData.slug = slugify(String(updateData.name));
        }
        // Update category name if categoryId changed
        if (updateData.categoryId) {
            const category = await db
                .collection('categories')
                .findOne({ _id: new mongodb_1.ObjectId(updateData.categoryId) });
            updateData.categoryName = category?.name || '';
        }
        // Match Next behavior: only convert if truthy
        if (updateData.price)
            updateData.price = Number(updateData.price);
        updateData.updatedAt = new Date();
        await db.collection('food_items').updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: updateData });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to update food item:', error);
        const body = req.body || {};
        const { _id, ...updateData } = body;
        if (!_id)
            return res.status(400).json({ error: 'ID required' });
        const items = await (0, fallbackStore_1.fallbackGetFoodItems)();
        const current = items.find((i) => i._id === String(_id));
        if (!current)
            return res.status(404).json({ error: 'Food item not found' });
        const nextName = updateData?.name ?? current.name;
        const nextSlug = updateData?.name ? slugify(String(nextName)) : current.slug;
        let categoryName = current.categoryName || '';
        const nextCategoryId = updateData?.categoryId ?? current.categoryId;
        if (updateData?.categoryId) {
            const cats = await (0, fallbackStore_1.fallbackGetCategories)();
            categoryName = cats.find((c) => c._id === String(nextCategoryId))?.name || '';
        }
        const next = await (0, fallbackStore_1.fallbackUpsertFoodItem)({
            _id: String(_id),
            name: String(nextName || ''),
            slug: nextSlug,
            description: updateData?.description ?? current.description ?? '',
            price: updateData?.price != null ? Number(updateData.price) : current.price,
            image: updateData?.image ?? current.image,
            categoryId: String(nextCategoryId || ''),
            categoryName,
            tags: updateData?.tags ?? current.tags ?? [],
            sizes: updateData?.sizes ?? current.sizes ?? [],
            active: updateData?.active ?? current.active,
            featured: updateData?.featured ?? current.featured,
        });
        return res.json({ success: true, item: next });
    }
});
// DELETE /api/admin/food-items?id=...
router.delete('/', async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            return res.status(400).json({ error: 'ID required' });
        }
        const { db } = await (0, db_1.connectToDatabase)();
        await db.collection('food_items').deleteOne({ _id: new mongodb_1.ObjectId(String(id)) });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to delete food item:', error);
        const id = req.query.id;
        if (!id)
            return res.status(400).json({ error: 'ID required' });
        const deleted = await (0, fallbackStore_1.fallbackDeleteFoodItem)(String(id));
        if (!deleted)
            return res.status(404).json({ error: 'Food item not found' });
        return res.json({ success: true });
    }
});
exports.default = router;
