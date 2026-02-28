import prisma from '../services/db.js';

const STORE_ID = process.env.STORE_ID || 'default-store';

// Legacy compatibility wrapper for frontend
export const listOrders = async (req, res) => getAll(req, res);
export const getOrder = async (req, res) => getOne(req, res);
export const getOrderStats = async (req, res) => getStats(req, res);

export const getAll = async (req, res) => {
    try {
        const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { storeId: STORE_ID };
        if (status) where.status = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;
        if (search) {
            where.OR = [
                { customer: { email: { contains: search, mode: 'insensitive' } } },
                { orderNumber: { equals: parseInt(search) || undefined } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: { select: { firstName: true, lastName: true, email: true } },
                    items: { include: { variant: { select: { title: true, product: { select: { title: true } } } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.order.count({ where }),
        ]);

        res.json({ data: orders, meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const getOne = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                customer: true,
                items: { include: { variant: { include: { product: true } } } },
            },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
        });
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
};

export const getStats = async (req, res) => {
    try {
        const [total, pending, processing, shipped] = await Promise.all([
            prisma.order.count({ where: { storeId: STORE_ID } }),
            prisma.order.count({ where: { storeId: STORE_ID, status: 'pending' } }),
            prisma.order.count({ where: { storeId: STORE_ID, status: 'processing' } }),
            prisma.order.count({ where: { storeId: STORE_ID, status: 'shipped' } }),
        ]);
        const revenue = await prisma.order.aggregate({
            where: { storeId: STORE_ID, paymentStatus: 'paid' },
            _sum: { total: true },
        });
        res.json({ data: { total, pending, processing, shipped, revenue: revenue._sum.total || 0 } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order stats' });
    }
};

export const createOrder = async (req, res) => {
    const { customerInfo, items, total, storeId = STORE_ID } = req.body;
    
    try {
        let customer = await prisma.customer.findUnique({
            where: { email: customerInfo.email }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    email: customerInfo.email,
                    firstName: customerInfo.firstName,
                    lastName: customerInfo.lastName,
                    storeId: storeId
                }
            });
        }

        const order = await prisma.order.create({
            data: {
                storeId,
                customerId: customer.id,
                total: total,
                status: 'pending',
                items: {
                    create: items.map(item => ({
                        variantId: item.variantId,
                        title: item.title || 'Product',
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                    }))
                }
            },
            include: {
                items: true
            }
        });

        res.status(201).json({ data: order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
