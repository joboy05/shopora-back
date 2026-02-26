import prisma from '../services/db.js';

export const getMarkets = async (req, res) => {
    try {
        const markets = await prisma.market.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(markets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createMarket = async (req, res) => {
    const { name, countries, currency, status } = req.body;
    try {
        const market = await prisma.market.create({
            data: {
                name,
                countries,
                currency,
                status,
                storeId: 'default-store-id' // Placeholder until auth is ready
            }
        });
        res.status(201).json(market);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMarket = async (req, res) => {
    const { id } = req.params;
    try {
        const market = await prisma.market.update({
            where: { id },
            data: req.body
        });
        res.json(market);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMarket = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.market.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
