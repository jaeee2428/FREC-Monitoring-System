const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma');

let prisma = null;

// Try to initialize Prisma with pg adapter
try {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  prisma = new PrismaClient({ adapter });
  console.log('Prisma client initialized with PostgreSQL adapter');
} catch (error) {
  console.log('Failed to initialize Prisma with PostgreSQL, using mock data:', error.message);
  prisma = null;
}

module.exports = prisma;
