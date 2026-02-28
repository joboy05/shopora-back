import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve the .env path
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const url = process.env.DATABASE_URL || 'file:./dev.db';

console.log('--- DATABASE SERVICE INITIALIZATION ---');
console.log('Using database:', url);

let prisma;

if (url.startsWith('file:')) {
    const adapter = new PrismaBetterSqlite3({ url });
    prisma = new PrismaClient({ adapter });
} else {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });
}

export default prisma;
