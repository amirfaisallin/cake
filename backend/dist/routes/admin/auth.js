"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ruthbah113918';
// POST /api/admin/auth
router.post('/', async (req, res) => {
    try {
        const body = req.body || {};
        const password = body.password;
        if (password === ADMIN_PASSWORD) {
            res.cookie('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 1000,
            });
            // Frontend expects `data.token` and stores it as `admin_token`.
            // We don't actually validate token server-side today, but we return one
            // for UI compatibility.
            return res.json({ success: true, token: 'admin_authenticated' });
        }
        return res.status(401).json({ success: false, error: 'Invalid password' });
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ success: false, error: 'Authentication failed' });
    }
});
// DELETE /api/admin/auth
router.delete('/', async (_req, res) => {
    try {
        res.clearCookie('admin_session');
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ success: false, error: 'Logout failed' });
    }
});
exports.default = router;
