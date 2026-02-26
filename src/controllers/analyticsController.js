import prisma from '../services/db.js';

export const getSummary = async (req, res) => {
    try {
        const [marketCount, catalogCount, pageCount, taxRuleCount] = await Promise.all([
            prisma.market.count(),
            prisma.catalog.count(),
            prisma.page.count(),
            prisma.taxRule.count()
        ]);

        const payoutSummary = await prisma.payout.aggregate({
            _sum: { amount: true },
        });

        res.json({
            markets: marketCount,
            catalogs: catalogCount,
            pages: pageCount,
            taxRules: taxRuleCount,
            totalRevenue: payoutSummary._sum.amount || 0,
            // Mock data for charts
            salesTrend: [
                { name: 'Jan', value: 4000 },
                { name: 'Feb', value: 3000 },
                { name: 'Mar', value: 2000 },
                { name: 'Apr', value: 2780 },
                { name: 'May', value: 1890 },
                { name: 'Jun', value: 2390 },
            ],
            marketDistribution: [
                { name: 'France', value: 400 },
                { name: 'US', value: 300 },
                { name: 'Canada', value: 300 },
                { name: 'Others', value: 200 },
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
