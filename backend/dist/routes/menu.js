"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const fallbackStore_1 = require("../lib/fallbackStore");
const router = (0, express_1.Router)();
// GET /api/menu
router.get('/', async (_req, res) => {
    try {
        const { db } = await (0, db_1.connectToDatabase)();
        const [menuItems, deliveryAreas] = await Promise.all([
            db.collection('menu_items').find({ active: true }).toArray(),
            db.collection('delivery_areas').find({ active: true }).sort({ name: 1 }).toArray(),
        ]);
        const cakeTypes = menuItems
            .filter((i) => i.type === 'cake_type')
            .map((i) => ({
            id: i.name,
            label: i.label,
            price: i.price,
        }));
        const sizes = menuItems
            .filter((i) => i.type === 'size')
            .map((i) => ({
            id: i.name,
            label: i.label,
            multiplier: i.multiplier,
        }));
        const flavors = menuItems
            .filter((i) => i.type === 'flavor')
            .map((i) => ({
            id: i.name,
            label: i.label,
        }));
        const areas = deliveryAreas.map((a) => ({
            id: a._id.toString(),
            name: a.name,
            charge: a.charge,
        }));
        res.json({
            success: true,
            cakeTypes,
            sizes,
            flavors,
            deliveryAreas: areas,
        });
    }
    catch (error) {
        console.error('Error fetching menu data:', error);
        const menuItems = await (0, fallbackStore_1.fallbackGetMenuItems)();
        const deliveryAreas = await (0, fallbackStore_1.fallbackGetDeliveryAreas)();
        const activeMenu = menuItems.filter((i) => i.active === true);
        const cakeTypes = activeMenu
            .filter((i) => i.type === 'cake_type')
            .map((i) => ({ id: i.name, label: i.label, price: i.price }));
        const sizes = activeMenu
            .filter((i) => i.type === 'size')
            .map((i) => ({ id: i.name, label: i.label, multiplier: i.multiplier }));
        const flavors = activeMenu
            .filter((i) => i.type === 'flavor')
            .map((i) => ({ id: i.name, label: i.label }));
        const areas = deliveryAreas
            .filter((a) => a.active === true)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((a) => ({ id: a._id.toString(), name: a.name, charge: a.charge }));
        res.json({
            success: true,
            cakeTypes,
            sizes,
            flavors,
            deliveryAreas: areas,
        });
    }
});
exports.default = router;
