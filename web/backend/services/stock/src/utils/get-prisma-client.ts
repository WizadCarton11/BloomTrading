import { PrismaClient } from "@prisma/client";

const prisma= new PrismaClient();

export function getPrismaClientOfStock(stock: string): any {
  if (stock === 'aapl') {
    return prisma.aapl; // Return the default Prisma client for Apple
  }
    if (stock === 'acn') {
        return prisma.acn; // Return the default Prisma client for Google
    }
    if (stock === 'msft') {
        return prisma.msft; // Return the default Prisma client for Microsoft
    }
  throw new Error(`No Prisma client found for stock: ${stock}`);
}