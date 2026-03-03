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

export const getDashboardStats = async (req, res) => {
    try {
        const [orderCount, revenue, teamCount, marketCount, lastOrders] = await Promise.all([
            prisma.order.count({ where: { storeId: STORE_ID } }),
            prisma.order.aggregate({
                where: { storeId: STORE_ID, status: 'delivered' },
                _sum: { total: true }
            }),
            prisma.user.count({ where: { storeId: STORE_ID } }),
            prisma.market.count({ where: { storeId: STORE_ID } }),
            prisma.order.findMany({
                where: { storeId: STORE_ID },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { customer: true }
            })
        ]);

        res.json({
            data: {
                totalRevenue: revenue._sum.total || 0,
                teamMembers: teamCount,
                totalOrders: orderCount,
                activeMarkets: marketCount,
                recentActivity: lastOrders.map(order => ({
                    id: order.id,
                    type: 'order',
                    title: `Order #${order.orderNumber}`,
                    description: `Order from ${order.customer ? order.customer.firstName + ' ' + order.customer.lastName : 'Unknown'}`,
                    time: order.createdAt,
                    amount: order.total,
                    status: order.status
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get team members for a store
export const getStoreTeam = async (req, res) => {
    try {
        const storeId = req.user?.storeId || 'default-store';
        const members = await prisma.user.findMany({
            where: { storeId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                status: true,
                twoFactorEnabled: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a team member's role
export const updateMemberRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const storeId = req.user?.storeId || 'default-store';

        // Ensure user belongs to this store
        const user = await prisma.user.findFirst({
            where: { id: userId, storeId }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Member not found in your team' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Remove a team member
export const removeTeamMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const storeId = req.user?.storeId || 'default-store';

        // Prevent removing self
        if (userId === req.user?.id) {
            return res.status(400).json({ success: false, error: 'You cannot remove yourself' });
        }

        // Ensure user belongs to this store
        const user = await prisma.user.findFirst({
            where: { id: userId, storeId }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Member not found in your team' });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get detailed analytics for Global Analytics page
export const getStoreAnalytics = async (req, res) => {
    try {
        const storeId = req.user?.storeId || 'default-store';

        // Real data extraction
        const totalRevenueResult = await prisma.order.aggregate({
            where: { storeId, status: 'delivered' },
            _sum: { total: true }
        });

        const totalOrders = await prisma.order.count({
            where: { storeId }
        });

        const totalCustomers = await prisma.customer.count({
            where: { storeId }
        });

        const activeMarkets = await prisma.market.count({
            where: { storeId, status: 'active' }
        });

        // Revenue data over time
        const orders = await prisma.order.findMany({
            where: { storeId },
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        // Process data for charts
        const revenueByDay = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + order.total;
            return acc;
        }, {});

        const chartData = Object.entries(revenueByDay).map(([date, total]) => ({
            date,
            total
        }));

        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenueResult._sum.total || 0,
                totalOrders,
                totalCustomers,
                activeMarkets,
                chartData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

