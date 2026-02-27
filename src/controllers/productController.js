import prisma from '../services/db.js';

const STORE_ID = process.env.STORE_ID || 'default-store';

export const getAll = async (req, res) => {
    try {
        const { status, vendor, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { storeId: STORE_ID };
        if (status) where.status = status;
        if (vendor) where.vendor = vendor;
        if (search) where.title = { contains: search, mode: 'insensitive' };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { variants: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.product.count({ where }),
        ]);

        res.json({ data: products, meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const getOne = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { variants: true },
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ data: product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const create = async (req, res) => {
    try {
        const { title, description, status, vendor, productType, tags, variants } = req.body;

        const product = await prisma.product.create({
            data: {
                storeId: STORE_ID,
                title,
                description,
                status: status || 'draft',
                vendor,
                productType,
                tags: tags || [],
                variants: variants ? {
                    create: variants.map(v => ({
                        title: v.title,
                        price: parseFloat(v.price),
                        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
                        sku: v.sku,
                        inventory: parseInt(v.inventory) || 0,
                        weight: v.weight ? parseFloat(v.weight) : null,
                        option1: v.option1,
                        option2: v.option2,
                    }))
                } : undefined,
            },
            include: { variants: true },
        });

        res.status(201).json({ data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const update = async (req, res) => {
    try {
        const { variants, ...rest } = req.body;
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: rest,
            include: { variants: true },
        });
        res.json({ data: product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const remove = async (req, res) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
