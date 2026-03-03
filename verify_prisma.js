import prisma from './src/services/db.js';
console.log('Collection model exists:', !!prisma.collection);
process.exit(0);
