// await global.__prisma.$transaction(async (tx) => {
//   const shops = await tx.shop.findMany();
//   const chocolatines = await tx.chocolatine.findMany();
//   const reviews = await tx.chocolatineReview.findMany();

//   for (const chocolatine of chocolatines) {
//     await prisma.chocolatine.update({
//       where: {
//         id: chocolatine.id,
//       },
//       data: {
//         shop_name: shops.find((shop) => shop.id === chocolatine.shop_id)?.name,
//         created_by_user_email: shops.find(
//           (shop) => shop.id === chocolatine.shop_id,
//         )?.created_by_user_email,
//       },
//     });
//   }

//   for (const review of reviews) {
//     await prisma.chocolatineReview.update({
//       where: {
//         id: review.id,
//       },
//       data: {
//         shop_name: shops.find((shop) => shop.id === review.shop_id)?.name,
//         user_email: shops.find((shop) => shop.id === review.shop_id)
//           ?.created_by_user_email,
//       },
//     });
//   }
// });
