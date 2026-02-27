import prisma from '../services/db.js';

const STORE_ID = process.env.STORE_ID || 'default-store';

export const getAll = async (req, res) => {
    try {
        const { search, tag, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { storeId: STORE_ID };
        if (tag) where.tag = tag;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    orders: { select: { id: true, total: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 },
                    _count: { select: { orders: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.customer.count({ where }),
        ]);

        res.json({ data: customers, meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

export const getOne = async (req, res) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: req.params.id },
            include: { orders: { include: { items: true }, orderBy: { createdAt: 'desc' } } },
        });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json({ data: customer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
};

export const create = async (req, res) => {
    try {
        const customer = await prisma.customer.create({
            data: { storeId: STORE_ID, ...req.body },
        });
        res.status(201).json({ data: customer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create customer' });
    }
};

export const update = async (req, res) => {
    try {
        const customer = await prisma.customer.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ data: customer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};
