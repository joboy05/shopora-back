import prisma from '../services/db.js';

const STORE_ID = process.env.STORE_ID || 'default-store';

// Legacy compatibility aliases for frontend
export const listProducts = async (req, res) => getAll(req, res);
export const getProduct = async (req, res) => getOne(req, res);
export const createProduct = async (req, res) => create(req, res);
export const updateProduct = async (req, res) => update(req, res);

// Map internal product to frontend format
const mapProduct = (p) => {
    if (!p) return null;
    const inventory = p.variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0;
    const price = p.variants?.[0]?.price || 0;
    return {
        ...p,
        name: p.title, // Map title to name for frontend
        inventory,
        price,
        category: p.productType // Map productType to category
    };
};

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

        const mappedProducts = products.map(mapProduct);

        res.json({ 
            data: mappedProducts, 
            meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } 
        });
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
        res.json({ data: mapProduct(product) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const create = async (req, res) => {
    try {
        const { name, title, description, status, vendor, productType, category, tags, variants, price, inventory } = req.body;

        // Use name if title is missing (for legacy frontend)
        const finalTitle = title || name;
        const finalType = productType || category;

        const product = await prisma.product.create({
            data: {
                storeId: STORE_ID,
                title: finalTitle,
                description,
                status: status || 'draft',
                vendor,
                productType: finalType,
                tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
                variants: variants ? {
                    create: variants.map(v => ({
                        title: v.title || v.name || 'Default Variant',
                        price: parseFloat(v.price),
                        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
                        sku: v.sku,
                        inventory: parseInt(v.inventory) || 0,
                        weight: v.weight ? parseFloat(v.weight) : null,
                        option1: v.option1,
                        option2: v.option2,
                    }))
                } : {
                    create: [{
                        title: 'Default Variant',
                        price: parseFloat(price) || 0,
                        inventory: parseInt(inventory) || 0
                    }]
                },
            },
            include: { variants: true },
        });

        res.status(201).json({ data: mapProduct(product) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const update = async (req, res) => {
    try {
        const { variants, name, category, ...rest } = req.body;
        
        // Map legacy fields back
        if (name) rest.title = name;
        if (category) rest.productType = category;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: rest,
            include: { variants: true },
        });
        res.json({ data: mapProduct(product) });
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
