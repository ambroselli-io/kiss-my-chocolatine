import { PrismaClient } from "@prisma/client";
import type { OpeningHoursSpecification } from "app/types/schemaOrgShop";
declare global {
  var __prisma: PrismaClient;
}
if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}
global.__prisma
  .$connect()
  .then(() => {
    console.log("Connected to DB");
  })
  .then(async () => {
    // migrations
    console.log("start migration !!");

    console.log("done migration");
  })
  .catch((e: Error) => {
    console.log("error connecting to DB");
    console.log(e);
  });

const prisma = global.__prisma;

export { prisma };
