"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const fallbackStore_1 = require("../lib/fallbackStore");
const router = (0, express_1.Router)();
// GET /api/food?category=...&featured=true
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const featured = req.query.featured === 'true';
        const { db } = await (0, db_1.connectToDatabase)();
        const query = { active: true };
        if (typeof category === 'string' && category && category !== 'all')
            query.categoryId = category;
        if (featured)
            query.featured = true;
        const [items, categories] = await Promise.all([
            db
                .collection('food_items')
                .find(query)
                .sort({ featured: -1, createdAt: -1 })
                .toArray(),
            db.collection('categories').find({ active: true }).sort({ order: 1 }).toArray(),
        ]);
        res.json({ items, categories });
    }
    catch (error) {
        console.error('Failed to fetch food data:', error);
        const category = req.query.category;
        const featured = req.query.featured === 'true';
        const categoriesAll = await (0, fallbackStore_1.fallbackGetCategories)();
        const itemsAll = await (0, fallbackStore_1.fallbackGetFoodItems)();
        const activeItems = itemsAll.filter((i) => i.active === true);
        const filtered = typeof category === 'string' && category && category !== 'all'
            ? activeItems.filter((i) => i.categoryId === category)
            : activeItems;
        const finalItems = featured ? filtered.filter((i) => i.featured === true) : filtered;
        const categories = categoriesAll.filter((c) => c.active).sort((a, b) => a.order - b.order);
        res.json({
            items: finalItems.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.createdAt < a.createdAt ? -1 : 1)),
            categories: categories.map((c) => ({ _id: c._id, name: c.name, slug: c.slug })),
        });
    }
});
exports.default = router;
