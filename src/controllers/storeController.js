import prisma from '../services/db.js';

const STORE_ID = process.env.STORE_ID || 'default-store';

export const getStoreInfo = async (req, res) => {
    try {
        const store = await prisma.store.findUnique({
            where: { id: STORE_ID }
        });
        if (!store) return res.status(404).json({ error: 'Store not found' });
        res.json({ data: store });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateStoreInfo = async (req, res) => {
    try {
        const store = await prisma.store.update({
            where: { id: STORE_ID },
            data: req.body
        });
        res.json({ data: store });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
