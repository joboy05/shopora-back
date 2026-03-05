import prisma from '../services/db.js';

const STORE_ID = process.env.STORE_ID || 'default-store';

export const getAll = async (req, res) => {
    try {
        const { search } = req.query;
        const storeId = req.user?.storeId || STORE_ID;

        const where = { storeId };
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const collections = await prisma.collection.findMany({
            where,
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: collections });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
};

export const getOne = async (req, res) => {
    try {
        const collection = await prisma.collection.findFirst({
            where: { 
                id: req.params.id,
                ...(req.user?.storeId ? { storeId: req.user.storeId } : {})
            },
            include: {
                products: {
                    include: { variants: true }
                }
            }
        });

        if (!collection) return res.status(404).json({ error: 'Collection not found' });

        res.json({ data: collection });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
};

export const create = async (req, res) => {
    try {
        const { title, description, slug, image, type, ruleSet, productIds } = req.body;
        const storeId = req.user?.storeId || STORE_ID;

        const collection = await prisma.collection.create({
            data: {
                storeId,
                title,
                description,
                slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                image,
                type: type || 'manual',
                ruleSet: ruleSet || null,
                products: productIds ? {
                    connect: productIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                products: true
            }
        });

        res.status(201).json({ data: collection });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create collection' });
    }
};

export const update = async (req, res) => {
    try {
        const { title, description, slug, image, type, ruleSet, productIds } = req.body;
        
        const data = { title, description, slug, image, type, ruleSet };
        
        if (productIds) {
            data.products = {
                set: productIds.map(id => ({ id }))
            };
        }

        const collection = await prisma.collection.update({
            where: { 
                id: req.params.id,
                storeId: req.user.storeId
            },
            data,
            include: {
                products: true
            }
        });

        res.json({ data: collection });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update collection' });
    }
};

export const remove = async (req, res) => {
    try {
        await prisma.collection.delete({
            where: { 
                id: req.params.id,
                storeId: req.user.storeId
            }
        });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete collection' });
    }
};
