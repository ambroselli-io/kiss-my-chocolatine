import { compileReviews, criterias } from "./review";

export function isChocolatineIncludedByFilters(chocolatine: any, filters: any) {
  const reviews = compileReviews(chocolatine.reviews ?? []);

  let isIncludedByFilters = Object.keys(filters).length === 0;
  if (Object.keys(filters).length > 0) {
    for (const key of Object.keys(filters)) {
      if (!criterias.hasOwnProperty(key)) continue;
      if (!filters[key].includes(String(Math.round(reviews[key])))) {
        return false;
      }
    }
  }

  const homemadeNumberValue = (() => {
    const prop = chocolatine?.additionalProperty.find(
      (prop) => prop.name === "Homemade",
    );
    if (prop.value === true) return "1";
    if (prop.value === false) return "0";
    return "null";
  })();

  if (Object.keys(filters).includes("homemade")) {
    if (!filters.homemade.includes(String(homemadeNumberValue))) return false;
  }

  if (!chocolatine.offers) return true;
  if (!Object.keys(filters).includes("price")) return true;

  if (filters.price.includes("1") && chocolatine.offers.price < 1) {
    isIncludedByFilters = true;
  }
  if (
    filters.price.includes("2") &&
    chocolatine.offers.price >= 1 &&
    chocolatine.offers.price < 2
  ) {
    isIncludedByFilters = true;
  }
  if (
    filters.price.includes("3") &&
    chocolatine.offers.price >= 2 &&
    chocolatine.offers.price < 3
  ) {
    isIncludedByFilters = true;
  }
  if (filters.price.includes("4") && chocolatine.offers.price >= 3) {
    isIncludedByFilters = true;
  }

  return isIncludedByFilters;
}

// export function isChocolatineIncludedByFilters(chocolatine: any, filters: any) {
//   const reviews = compileReviews(chocolatine.reviews ?? []);

//   let isIncludedByFilters = filters.length === 0;
//   if (filters.length > 0) {
//     for (const [key, value] of Object.entries(reviews)) {
//       if (filters.includes(`${key}-${Math.round(value)}`)) {
//         isIncludedByFilters = true;
//         break;
//       }
//     }
//   }

//   const isHomemade = String(
//     chocolatine?.additionalProperty.find((prop) => prop.name === "Homemade")
//       ?.value,
//   );

//   if (filters.includes("homemade-1") && isHomemade === "true") {
//     isIncludedByFilters = true;
//   }
//   if (filters.includes("homemade-0") && isHomemade === "false") {
//     isIncludedByFilters = true;
//   }

//   if (!chocolatine.offers) return isIncludedByFilters;

//   if (filters.includes("price-1") && chocolatine.offers.price < 1) {
//     isIncludedByFilters = true;
//   }
//   if (
//     filters.includes("price-2") &&
//     chocolatine.offers.price >= 1 &&
//     chocolatine.offers.price < 2
//   ) {
//     isIncludedByFilters = true;
//   }
//   if (
//     filters.includes("price-3") &&
//     chocolatine.offers.price >= 2 &&
//     chocolatine.offers.price < 3
//   ) {
//     isIncludedByFilters = true;
//   }
//   if (filters.includes("price-4") && chocolatine.offers.price >= 3) {
//     isIncludedByFilters = true;
//   }

//   return isIncludedByFilters;
// }
