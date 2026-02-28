import prisma from '../services/db.js';

// --- Metaobject Definitions ---

export const listDefinitions = async (req, res) => {
  try {
    const definitions = await prisma.metaobjectDefinition.findMany();
    res.json(definitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDefinition = async (req, res) => {
  const { name, type, description, fieldDefinitions, storeId } = req.body;
  try {
    const definition = await prisma.metaobjectDefinition.create({
      data: { name, type, description, fieldDefinitions, storeId }
    });
    res.status(201).json(definition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Metaobject Entries ---

export const listEntries = async (req, res) => {
  const { type } = req.params;
  try {
    const entries = await prisma.metaobjectEntry.findMany({
      where: {
        definition: { type }
      },
      include: {
        definition: true
      }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEntry = async (req, res) => {
  const { definitionId, fields } = req.body;
  try {
    const entry = await prisma.metaobjectEntry.create({
      data: { definitionId, fields }
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Metafields (Custom fields on existing objects) ---

export const getMetafields = async (req, res) => {
  const { ownerType, ownerId } = req.query;
  try {
    const metafields = await prisma.metafield.findMany({
      where: { ownerId, ownerType }
    });
    res.json(metafields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMetafield = async (req, res) => {
  const { ownerId, ownerType, namespace, key, value, type } = req.body;
  try {
    const metafield = await prisma.metafield.upsert({
      where: {
        ownerId_ownerType_namespace_key: { ownerId, ownerType, namespace, key }
      },
      update: { value, type },
      create: { ownerId, ownerType, namespace, key, value, type }
    });
    res.status(201).json(metafield);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
