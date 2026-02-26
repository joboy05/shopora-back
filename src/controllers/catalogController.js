import prisma from '../services/db.js';

export const getCatalogs = async (req, res) => {
    try {
        const catalogs = await prisma.catalog.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(catalogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createCatalog = async (req, res) => {
    const { name, marketIds, status } = req.body;
    try {
        const catalog = await prisma.catalog.create({
            data: {
                name,
                marketIds,
                status,
                storeId: 'default-store-id' // Placeholder until auth is ready
            }
        });
        res.status(201).json(catalog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCatalog = async (req, res) => {
    const { id } = req.params;
    try {
        const catalog = await prisma.catalog.update({
            where: { id },
            data: req.body
        });
        res.json(catalog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCatalog = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.catalog.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
