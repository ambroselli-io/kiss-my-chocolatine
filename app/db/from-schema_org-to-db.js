// // create shops
// await global.__prisma.$transaction(async (tx) => {
//   for (const shop of shops) {
//     const shopDB = await tx.shop.create({
//       data: {
//         description: shop.description,
//         name: shop.name,
//         telephone: shop.telephone,
//         url: shop.url,
//         streetAddress: shop.address.streetAddress,
//         addresspostalCode: shop.address.postalCode,
//         addressLocality: shop.address.addressLocality,
//         addressCountry: shop.address.addressCountry,
//         latitude: shop.geo.latitude,
//         longitude: shop.geo.longitude,
//         openingHoursSpecification: shop.openingHoursSpecification,
//         created_by_user_id: "{arnaud_id}",
//       },
//     });
//     const chocolatine = chocolatines.find(
//       (chocolatine) => chocolatine.belongsTo.identifier === shop.identifier,
//     );
//     if (!chocolatine) continue;
//     const reviews = chocolatine.reviews.map((review) => {
//       return {
//         created_at: review.datePublished,
//         user_username: review.author.name,
//         comment: review.reviewBody,
//         light_or_dense: review.additionalProperty.find(
//           (p) => p.name === "light_or_dense",
//         )?.value,
//         flaky_or_brioche: review.additionalProperty.find(
//           (p) => p.name === "flaky_or_brioche",
//         )?.value,
//         buttery: review.additionalProperty.find((p) => p.name === "buttery")
//           ?.value,
//         golden_or_pale: review.additionalProperty.find(
//           (p) => p.name === "golden_or_pale",
//         )?.value,
//         crispy_or_soft: review.additionalProperty.find(
//           (p) => p.name === "crispy_or_soft",
//         )?.value,
//         big_or_small: review.additionalProperty.find(
//           (p) => p.name === "big_or_small",
//         )?.value,
//         chocolate_disposition: review.additionalProperty.find(
//           (p) => p.name === "chocolate_disposition",
//         )?.value,
//         good_or_not_good: review.additionalProperty.find(
//           (p) => p.name === "good_or_not_good",
//         )?.value,
//       };
//     });
//     const quality = compileReviews(reviews);
//     const chocolatineDB = await tx.chocolatine.create({
//       data: {
//         price: Number(chocolatine.offers.price),
//         priceCurrency: chocolatine.offers.priceCurrency,
//         homemade: chocolatine.additionalProperty[0].value,
//         shop_id: shopDB.id,
//         has_been_reviewed_once: chocolatine?.reviews?.length > 0,
//         average_buttery: quality.average_buttery,
//         average_light_or_dense: quality.average_light_or_dense,
//         average_flaky_or_brioche: quality.average_flaky_or_brioche,
//         average_golden_or_pale: quality.average_golden_or_pale,
//         average_crispy_or_soft: quality.average_crispy_or_soft,
//         average_big_or_small: quality.average_big_or_small,
//         average_chocolate_disposition: quality.average_chocolate_disposition,
//         average_good_or_not_good: quality.average_good_or_not_good,
//         created_by_user_id: "{arnaud_id}",
//       },
//     });
//     for (const review of reviews) {
//       await tx.chocolatineReview.create({
//         data: {
//           created_at: new Date(review.created_at),
//           user_username: review.user_username,
//           chocolatine_id: chocolatineDB.id,
//           shop_id: shopDB.id,
//           user_id: "{arnaud_id}",
//           comment: review.comment,
//           user_id_chocolatine_id: `{arnaud_id}-${chocolatineDB.id}`,
//           light_or_dense: review.light_or_dense,
//           flaky_or_brioche: review.flaky_or_brioche,
//           buttery: review.buttery,
//           golden_or_pale: review.golden_or_pale,
//           crispy_or_soft: review.crispy_or_soft,
//           big_or_small: review.big_or_small,
//           chocolate_disposition: review.chocolate_disposition,
//           good_or_not_good: review.good_or_not_good,
//         },
//       });
//     }
//   }
// });
