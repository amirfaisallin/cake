"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackCreateOrder = fallbackCreateOrder;
exports.fallbackGetOrders = fallbackGetOrders;
exports.fallbackUpdateOrder = fallbackUpdateOrder;
exports.fallbackDeleteOrder = fallbackDeleteOrder;
exports.fallbackFindByOrderNumber = fallbackFindByOrderNumber;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const dataDir = path_1.default.join(process.cwd(), 'data');
const ordersFile = path_1.default.join(dataDir, 'orders.fallback.json');
async function ensureDataDir() {
    await promises_1.default.mkdir(dataDir, { recursive: true });
}
async function readOrders() {
    try {
        const raw = await promises_1.default.readFile(ordersFile, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
            return parsed;
        return [];
    }
    catch (e) {
        if (e?.code === 'ENOENT')
            return [];
        return [];
    }
}
async function writeOrders(orders) {
    await ensureDataDir();
    await promises_1.default.writeFile(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
}
async function fallbackCreateOrder(order) {
    const orders = await readOrders();
    const now = new Date().toISOString();
    const created = {
        _id: crypto_1.default.randomUUID(),
        ...order,
        createdAt: now,
        updatedAt: now,
    };
    orders.unshift(created);
    await writeOrders(orders);
    return created;
}
async function fallbackGetOrders(status) {
    const orders = await readOrders();
    const filtered = status && status !== 'all' ? orders.filter((o) => o.status === status) : orders;
    filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return filtered;
}
async function fallbackUpdateOrder(id, patch) {
    const orders = await readOrders();
    const idx = orders.findIndex((o) => o._id === id);
    if (idx === -1)
        return null;
    const now = new Date().toISOString();
    orders[idx] = {
        ...orders[idx],
        ...patch,
        updatedAt: now,
    };
    await writeOrders(orders);
    return orders[idx];
}
async function fallbackDeleteOrder(id) {
    const orders = await readOrders();
    const next = orders.filter((o) => o._id !== id);
    const deleted = next.length !== orders.length;
    if (deleted)
        await writeOrders(next);
    return deleted;
}
async function fallbackFindByOrderNumber(orderNumber) {
    const orders = await readOrders();
    return orders.find((o) => o.orderNumber === String(orderNumber).toUpperCase()) || null;
}
