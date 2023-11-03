import { isOpenedNow } from "./isOpenedNow";
import type { ChocolatineFiltersInterface } from "~/types/chocolatineCriterias";
import type { Chocolatine, Shop } from "@prisma/client";

export const availableFilters: Record<
  keyof ChocolatineFiltersInterface,
  "chocolatine_criteria" | "chocolatine" | "shop"
> = {
  average_buttery: "chocolatine_criteria",
  average_flaky_or_brioche: "chocolatine_criteria",
  average_golden_or_pale: "chocolatine_criteria",
  average_crispy_or_soft: "chocolatine_criteria",
  average_light_or_dense: "chocolatine_criteria",
  average_chocolate_disposition: "chocolatine_criteria",
  average_big_or_small: "chocolatine_criteria",
  average_good_or_not_good: "chocolatine_criteria",
  opened_now: "shop",
  homemade: "chocolatine",
  price: "chocolatine",
};

const shopCriterias = ["opened_now"];

export function isChocolatineIncludedByFilters(
  filters: ChocolatineFiltersInterface,
  shop: Shop,
  chocolatine: Chocolatine | null,
) {
  let isIncludedByFilters = Object.keys(filters).length === 0;
  if (Object.keys(filters).length > 0) {
    for (const filterKey of Object.keys(filters)) {
      const key = filterKey as keyof ChocolatineFiltersInterface;
      if (!availableFilters[key]) continue;
      if (!chocolatine) continue;
      if (availableFilters[key] === "chocolatine_criteria") {
        const criteria = key as keyof Chocolatine;
        const value = String(chocolatine[criteria]);
        if (!filters[criteria]?.includes(value)) {
          return false;
        }
      }
    }
  }

  const homemadeNumberValue = (() => {
    switch (chocolatine?.homemade) {
      default:
      case "I don't know, nobody tried yet":
        return "null";
      case "Yes":
      case "I think so":
        return "1";
      case "I don't think so":
      case "No":
        return "0";
    }
  })();

  const openedNowValue = (() => {
    const [isOpened] = isOpenedNow(shop);
    if (isOpened === true) return "1";
    if (isOpened === false) return "0";
    return "null";
  })();

  if (Object.keys(filters).includes("homemade")) {
    if (!filters.homemade?.includes(String(homemadeNumberValue))) return false;
  }
  if (Object.keys(filters).includes("opened_now")) {
    if (!filters.opened_now?.includes(String(openedNowValue))) return false;
  }

  if (!chocolatine?.price) return true;
  if (!Object.keys(filters).includes("price")) return true;

  if (filters.price?.includes("1") && chocolatine.price < 1) {
    isIncludedByFilters = true;
  }
  if (
    filters.price?.includes("2") &&
    chocolatine.price >= 1 &&
    chocolatine.price < 2
  ) {
    isIncludedByFilters = true;
  }
  if (
    filters.price?.includes("3") &&
    chocolatine.price >= 2 &&
    chocolatine.price < 3
  ) {
    isIncludedByFilters = true;
  }
  if (filters.price?.includes("4") && chocolatine.price >= 3) {
    isIncludedByFilters = true;
  }

  return isIncludedByFilters;
}
