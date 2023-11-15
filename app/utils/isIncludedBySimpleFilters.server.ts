import { isOpenedNow } from "./isOpenedNow";
import type { ChocolatineFiltersInterface } from "~/types/chocolatineCriterias";
import type { Shop } from "@prisma/client";

export const availableFilters: Record<string, "chocolatine" | "shop"> = {
  opened_now: "shop",
  homemade: "chocolatine",
  price: "chocolatine",
};

export function isShopIncludedBySimpleFilters(
  filters: ChocolatineFiltersInterface,
  shop: Shop,
) {
  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) return true;

  if (filterKeys.includes("homemade")) {
    const homemadeNumberValue = (() => {
      switch (shop?.chocolatine_homemade) {
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
    if (!filters.homemade?.includes(String(homemadeNumberValue))) return false;
  }
  if (filterKeys.includes("opened_now")) {
    const openedNowValue = (() => {
      const [isOpened] = isOpenedNow(shop);
      if (isOpened === true) return "1";
      if (isOpened === false) return "0";
      return "null";
    })();
    if (!filters.opened_now?.includes(String(openedNowValue))) {
      return false;
    }
  }

  return true;
}
