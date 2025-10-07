// scripts/ping.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log(await prisma.$queryRaw`SELECT 1`);
}
main().finally(() => prisma.$disconnect());
