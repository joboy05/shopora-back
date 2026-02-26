import prisma from '../services/db.js';

export const getPayouts = async (req, res) => {
    try {
        const payouts = await prisma.payout.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPayoutSummary = async (req, res) => {
    try {
        const totalPaid = await prisma.payout.aggregate({
            _sum: { amount: true },
            where: { status: 'paid' }
        });
        const pending = await prisma.payout.aggregate({
            _sum: { amount: true },
            where: { status: 'pending' }
        });
        res.json({
            totalPaid: totalPaid._sum.amount || 0,
            pending: pending._sum.amount || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
