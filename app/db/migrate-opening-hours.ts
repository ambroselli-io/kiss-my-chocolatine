// // create shops
// await global.__prisma.$transaction(async (tx) => {
//   const shops = await tx.shop.findMany({
//     where: {
//       openingHoursSpecification: {
//         not: "",
//       },
//     },
//   });
//   console.log(
//     `Found ${shops.length} shops with opening hours specification`,
//   );
//   const dyasOfWeek = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];
//   for (const shop of shops) {
//     console.log(shop.id);
//     const data: {
//       [key: string]: string | null;
//     } = {
//       opening_hours_monday_open: null,
//       opening_hours_monday_close: null,
//       opening_hours_tuesday_open: null,
//       opening_hours_tuesday_close: null,
//       opening_hours_wednesday_open: null,
//       opening_hours_wednesday_close: null,
//       opening_hours_thursday_open: null,
//       opening_hours_thursday_close: null,
//       opening_hours_friday_open: null,
//       opening_hours_friday_close: null,
//       opening_hours_saturday_open: null,
//       opening_hours_saturday_close: null,
//       opening_hours_sunday_open: null,
//       opening_hours_sunday_close: null,
//       openingHoursSpecification: "",
//     };
//     for (const openingHours of shop.openingHoursSpecification as unknown as Array<OpeningHoursSpecification>) {
//       for (const dayOfWeek of openingHours.dayOfWeek) {
//         if (!dyasOfWeek.includes(dayOfWeek)) {
//           console.log(`day of week ${dayOfWeek} is not valid`);
//           continue;
//         }
//         data[`opening_hours_${dayOfWeek.toLowerCase()}_open`] =
//           openingHours.opens;
//         data[`opening_hours_${dayOfWeek.toLowerCase()}_close`] =
//           openingHours.closes;
//       }
//     }
//     await tx.shop.update({
//       where: {
//         id: shop.id,
//       },
//       data,
//     });
//   }
// });
