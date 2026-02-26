import prisma from '../services/db.js';

export const getTaxRules = async (req, res) => {
    try {
        const taxRules = await prisma.taxRule.findMany({
            include: { market: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(taxRules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createTaxRule = async (req, res) => {
    const { name, rate, marketId } = req.body;
    try {
        const taxRule = await prisma.taxRule.create({
            data: {
                name,
                rate: parseFloat(rate),
                marketId,
                storeId: 'default-store-id'
            }
        });
        res.status(201).json(taxRule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTaxRule = async (req, res) => {
    const { id } = req.params;
    try {
        const taxRule = await prisma.taxRule.update({
            where: { id },
            data: {
                ...req.body,
                rate: req.body.rate ? parseFloat(req.body.rate) : undefined
            }
        });
        res.json(taxRule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTaxRule = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.taxRule.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
