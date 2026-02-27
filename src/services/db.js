import Prisma from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { PrismaClient } = Prisma;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve the .env path
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const url = process.env.DATABASE_URL;

console.log('--- DATABASE SERVICE INITIALIZATION ---');
console.log('DATABASE_URL status:', url ? 'FOUND' : 'NOT FOUND');

if (!url) {
    throw new Error('DATABASE_URL is missing from environment variables.');
}

// In Prisma v7, prisma+postgres:// URLs are treated as cloud/accelerate URLs
// and require either a Driver Adapter or being passed via accelerateUrl
const prisma = new PrismaClient({
    accelerateUrl: url
});

export default prisma;
