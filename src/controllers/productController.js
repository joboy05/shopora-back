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
        const { name, title, description, status, vendor, productType, category, tags, variants, price, inventory, options, media } = req.body;
        const storeId = req.user?.storeId || STORE_ID;

        const finalTitle = title || name;
        const finalType = productType || category;

        // Helper to generate variants from options if not provided
        const generateVariants = (opts) => {
            if (!opts || !Array.isArray(opts) || opts.length === 0) return [];
            let result = [{}];
            opts.forEach((opt, i) => {
                const next = [];
                const values = Array.isArray(opt.values) ? opt.values : [];
                values.forEach(v => {
                    result.forEach(r => next.push({ ...r, [`option${i + 1}`]: v }));
                });
                result = next;
            });
            return result.map(v => ({
                title: Object.values(v).join(' / '),
                price: parseFloat(price) || 0,
                inventory: parseInt(inventory) || 0,
                ...v
            }));
        };

        const finalVariants = variants && Array.isArray(variants) && variants.length > 0 
            ? variants 
            : generateVariants(options);

        const product = await prisma.product.create({
            data: {
                storeId,
                title: finalTitle,
                description,
                status: status || 'draft',
                vendor,
                productType: finalType,
                tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
                options: options || null,
                media: media || null,
                variants: finalVariants.length > 0 ? {
                    create: finalVariants.map(v => ({
                        title: v.title || 'Default Variant',
                        price: parseFloat(v.price) || 0,
                        compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
                        sku: v.sku,
                        inventory: parseInt(v.inventory) || 0,
                        weight: v.weight ? parseFloat(v.weight) : null,
                        option1: v.option1,
                        option2: v.option2,
                        option3: v.option3,
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
        console.error('Product Create Error:', error);
        res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
};

// Update inventory for a specific variant
export const updateInventory = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const { inventory } = req.body;
        const storeId = req.user?.storeId || STORE_ID;

        // Verify product/variant belongs to store
        const variant = await prisma.productVariant.findFirst({
            where: {
                id: variantId,
                productId,
                product: { storeId }
            }
        });

        if (!variant) return res.status(404).json({ error: 'Variant not found' });

        const updated = await prisma.productVariant.update({
            where: { id: variantId },
            data: { inventory: parseInt(inventory) }
        });

        res.json({ data: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update inventory' });
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
