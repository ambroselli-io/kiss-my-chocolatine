// Assuming you want to include PrismaClient type
import { PrismaClient } from "@prisma/client";

declare global {
  interface Global {
    prisma: PrismaClient;
  }
  interface Error {
    status?: number;
  }
}
