"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const tls_1 = __importDefault(require("tls"));
const food_1 = __importDefault(require("./routes/food"));
const menu_1 = __importDefault(require("./routes/menu"));
const orders_1 = __importDefault(require("./routes/orders"));
const upload_1 = __importDefault(require("./routes/upload"));
const settings_1 = __importDefault(require("./routes/settings"));
const auth_1 = __importDefault(require("./routes/admin/auth"));
const categories_1 = __importDefault(require("./routes/admin/categories"));
const delivery_1 = __importDefault(require("./routes/admin/delivery"));
const food_items_1 = __importDefault(require("./routes/admin/food-items"));
const menu_2 = __importDefault(require("./routes/admin/menu"));
const settings_2 = __importDefault(require("./routes/admin/settings"));
const stats_1 = __importDefault(require("./routes/admin/stats"));
const db_1 = require("./lib/db");
// Load env from `backend/.env.local` first (repo-wide ignored by `.gitignore`),
// then fallback to `backend/.env`.
const envLocal = dotenv_1.default.config({ path: '.env.local' });
if (envLocal.error) {
    dotenv_1.default.config();
}
// Windows/Node TLS negotiation sometimes fails with Atlas SRV connections.
// For stability in this environment, force TLS 1.2 for all outgoing TLS sockets.
tls_1.default.DEFAULT_MIN_VERSION = 'TLSv1.2';
tls_1.default.DEFAULT_MAX_VERSION = 'TLSv1.2';
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.get('/health', (_req, res) => res.json({ ok: true }));
// Public API
app.use('/api/food', food_1.default);
app.use('/api/menu', menu_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/settings', settings_1.default);
// Admin API
app.use('/api/admin/auth', auth_1.default);
app.use('/api/admin/categories', categories_1.default);
app.use('/api/admin/delivery', delivery_1.default);
app.use('/api/admin/food-items', food_items_1.default);
app.use('/api/admin/menu', menu_2.default);
app.use('/api/admin/settings', settings_2.default);
app.use('/api/admin/stats', stats_1.default);
const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
});
// Log DB connectivity once at startup.
// (Requests will still use the cached connection; this is just for your confirmation.)
(0, db_1.connectToDatabase)()
    .then(({ db }) => {
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${db.databaseName}`);
})
    .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB not connected:', err?.message || err);
});
