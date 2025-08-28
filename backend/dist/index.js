"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const invoices_1 = require("./routes/invoices");
const passengers_1 = require("./routes/passengers");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/invoices', invoices_1.invoiceRoutes);
app.use('/api/passengers', passengers_1.passengerRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
