import prisma from '../services/db.js';

export const listProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, description, status, handle, tags, variants, storeId } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        status,
        handle,
        tags,
        storeId,
        variants: {
          create: variants || []
        }
      },
      include: {
        variants: true
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, handle, tags } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        status,
        handle,
        tags
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
