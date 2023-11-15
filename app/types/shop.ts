import type { Shop } from "@prisma/client";

export type ShopForPinOnMap = {
  id: Shop["id"];
  latitude: Shop["latitude"];
  longitude: Shop["longitude"];
  chocolatine_has_been_reviewed_once: Shop["chocolatine_has_been_reviewed_once"];
  chocolatine_homemade: Shop["chocolatine_homemade"];
};
