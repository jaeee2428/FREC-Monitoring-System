const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://certtrack_admin:certtrack_pass@localhost:5432/certtrack_dev",
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
