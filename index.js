import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import marketRoutes from './src/routes/marketRoutes.js';
import catalogRoutes from './src/routes/catalogRoutes.js';
import taxRuleRoutes from './src/routes/taxRuleRoutes.js';
import payoutRoutes from './src/routes/payoutRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import themeRoutes from './src/routes/themeRoutes.js';
import productRoutes from './src/routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/markets', marketRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/tax-rules', taxRuleRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/products', productRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Settings boilerplate
app.get('/api/settings', (req, res) => {
    res.json({
        storeName: 'Shopora Store',
        contactEmail: 'admin@shopora.fr',
        currency: 'EUR',
        unitSystem: 'metric',
        taxRate: 20
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
