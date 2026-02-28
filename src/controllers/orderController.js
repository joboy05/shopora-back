import prisma from '../services/db.js';

export const listOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const [total, pending, processing, shipped, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'shipped' } }),
      prisma.order.aggregate({
        _sum: { total: true }
      })
    ]);

    res.json({
      data: {
        total,
        pending,
        processing,
        shipped,
        revenue: revenue._sum.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { customerInfo, items, total, storeId } = req.body;
  
  try {
    // 1. Find or create customer
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

    // 2. Create order
    const order = await prisma.order.create({
      data: {
        storeId,
        customerId: customer.id,
        total: total,
        status: 'paid', // Hardcoded for simplicity in this phase
        items: {
          create: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 3. Update inventory (Optional but good for Phase 2)
    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          inventoryQuantity: {
            decrement: item.quantity
          }
        }
      });
    }

    res.status(201).json({ data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
