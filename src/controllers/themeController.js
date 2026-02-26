import prisma from '../services/db.js';

export const getThemes = async (req, res) => {
    try {
        const themes = await prisma.theme.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(themes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createTheme = async (req, res) => {
    const { name, version, settings } = req.body;
    try {
        const theme = await prisma.theme.create({
            data: {
                name,
                version,
                settings,
                status: 'inactive',
                storeId: 'default-store-id'
            }
        });
        res.status(201).json(theme);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTheme = async (req, res) => {
    const { id } = req.params;
    try {
        const theme = await prisma.theme.update({
            where: { id },
            data: req.body
        });
        res.json(theme);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const publishTheme = async (req, res) => {
    const { id } = req.params;
    try {
        // First deactivate all themes
        await prisma.theme.updateMany({
            where: { storeId: 'default-store-id' },
            data: { status: 'inactive' }
        });

        // Then publish the target one
        const theme = await prisma.theme.update({
            where: { id },
            data: { status: 'current' }
        });
        res.json(theme);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTheme = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.theme.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
