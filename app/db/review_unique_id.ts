import { PrismaClient } from "@prisma/client";
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
    // create shops
    await global.__prisma.$transaction(async (tx) => {
      const chocolatineReviews = await tx.chocolatineReview.findMany();
      for (const chocolatineReview of chocolatineReviews) {
        await tx.chocolatineReview.update({
          where: {
            id: chocolatineReview.id,
          },
          data: {
            user_id_shop_id: `${chocolatineReview.user_id}_${chocolatineReview.shop_id}`,
          },
        });
      }
    });

    console.log("done migration");
  })
  .catch((e: Error) => {
    console.log("error connecting to DB");
    console.log(e);
  });

const prisma = global.__prisma;

export { prisma };
