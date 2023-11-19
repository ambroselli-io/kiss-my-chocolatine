import type {
  MetaFunction,
  MetaArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import {
  Layer,
  Map,
  MapProvider,
  NavigationControl,
  Source,
  GeolocateControl,
} from "react-map-gl";
import type { MapRef } from "react-map-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import type { Shop } from "@prisma/client";
import type { SchemaOrgShop } from "../types/schemaOrgShop";
import { useCallback, useEffect, useRef, useState } from "react";
import MapImage from "~/components/MapImage";
import Onboarding from "~/components/Onboarding";
import {
  isShopIncludedBySimpleFilters,
  availableFilters,
} from "~/utils/isIncludedBySimpleFilters.server";
import type { CustomFeature, CustomFeatureCollection } from "~/types/geojson";
import type { ChocolatineFiltersInterface } from "~/types/chocolatineCriterias";
import { prisma } from "~/db/prisma.server";
import { getUserIdFromCookie } from "~/services/auth.server";
import BurgerMenu from "~/components/BurgerMenu";
import { shopFromRowToSchemaOrg } from "~/utils/schemaOrg";
import type { ShopForPinOnMap } from "~/types/shop";

type loaderData = {
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  total: number;
  geojson_included_by_filters: CustomFeatureCollection;
  geojson_excluded_by_filters: CustomFeatureCollection;
  user_id?: string;
  // shopSchemaOrg: Array<SchemaOrgShop>;
};

// export const meta: MetaFunction = ({ matches, data }: MetaArgs) => {
//   const parentMeta = matches[matches.length - 2].meta ?? [];
//   const shopSchemaOrg = (data as loaderData)
//     .shopSchemaOrg as Array<SchemaOrgShop>;

//   return [
//     ...parentMeta,
//     ...shopSchemaOrg.map((shop) => ({
//       "script:ld+json": shop,
//     })),
//   ];
// };

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const europe = {
    longitude: 2.2137,
    latitude: 46.6034,
    zoom: 4,
  };

  let now = Date.now();

  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      longitude: true,
      latitude: true,
      chocolatine_has_been_reviewed_once: true,
      chocolatine_homemade: true,
    },
  });

  console.log("now 1", Date.now() - now, "ms");
  now = Date.now();

  /* filters */
  const url = new URL(request.url);
  const filters: ChocolatineFiltersInterface = {};
  for (let searchParamKey of url.searchParams.keys()) {
    if (!availableFilters[searchParamKey]) continue;
    const filterKey = searchParamKey as keyof ChocolatineFiltersInterface;
    filters[filterKey] = url.searchParams.getAll(filterKey as string);
  }
  console.log("now 2", Date.now() - now, "ms");
  now = Date.now();

  const isHomeMade: Record<string, number> = {
    "I think so": 1,
    Yes: 1,
    "I don't think so": 0,
    No: 0,
    "I don't know, nobody tried yet": 0,
  };
  const isIndus: Record<string, number> = {
    "I think so": 0,
    Yes: 0,
    "I don't think so": 1,
    No: 1,
    "I don't know, nobody tried yet": 0,
  };

  const shopObject: Record<string, ShopForPinOnMap> = {};
  const featuresIncludedByFilters: Array<CustomFeature> = [];
  const featuresExcludedByFilters: Array<CustomFeature> = [];
  // const shopSchemaOrg = [];
  let currentShop = null;
  for (const shop of shops) {
    shopObject[shop.id] = shop;
    if (!shop.longitude) continue;
    if (!shop.latitude) continue;

    const isActiveShop = shop.id === params?.shopId;
    if (isActiveShop) currentShop = shop;
    const isIncludedByFilters = isShopIncludedBySimpleFilters(filters, shop);

    const feature: CustomFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [shop.longitude, shop.latitude],
      },
      properties: {
        id: shop.id,
        is_active_shop: isActiveShop ? 1 : 0,
        is_home_made: isHomeMade[shop?.chocolatine_homemade],
        is_industrial: isIndus[shop?.chocolatine_homemade],
        is_included_by_filters: isIncludedByFilters ? 1 : 0,
        sort_key: isActiveShop
          ? 4
          : isIncludedByFilters
          ? 3
          : shop?.chocolatine_has_been_reviewed_once
          ? 2
          : 1,
        has_review: !!shop?.chocolatine_has_been_reviewed_once,
      },
    };
    if (isIncludedByFilters) featuresIncludedByFilters.push(feature);
    if (!isIncludedByFilters) featuresExcludedByFilters.push(feature);
    // shopSchemaOrg.push(shopFromRowToSchemaOrg(shop));
  }
  console.log("now 3", Date.now() - now, "ms");
  now = Date.now();
  const initialViewState = (() => {
    if (!params.shopId) return europe;
    if (!currentShop) return europe;
    return {
      longitude: currentShop.longitude as number,
      latitude: currentShop.latitude as number,
      zoom: 14,
    };
  })();
  console.log("now 4", Date.now() - now, "ms");
  now = Date.now();
  const data: loaderData = {
    user_id: await getUserIdFromCookie(request, { optional: true }),
    initialViewState,
    total: shops.length,
    // shopSchemaOrg,
    geojson_included_by_filters: {
      type: "FeatureCollection",
      features: featuresIncludedByFilters,
    },
    geojson_excluded_by_filters: {
      type: "FeatureCollection",
      features: featuresExcludedByFilters,
    },
  };
  console.log("now 5", Date.now() - now, "ms");
  now = Date.now();
  return data;
};
// https://www.iletaitunefoislapatisserie.com/2013/04/pains-au-chocolat.html
export default function App() {
  const {
    user_id,
    initialViewState,
    total,
    geojson_included_by_filters,
    geojson_excluded_by_filters,
  } = useLoaderData<typeof loader>();
  const params = useParams();

  const [mapboxAccessToken, setMapboxAccessToken] = useState("");
  const [isHoveringFeature, setIsHoveringFeature] = useState(false);
  const [searchParams] = useSearchParams();

  const now = useRef(Date.now());

  const navigate = useNavigate();
  useEffect(() => {
    setMapboxAccessToken(window.ENV.MAPBOX_ACCESS_TOKEN);
  }, []);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  useEffect(() => {
    const isOnboardingDone = window.localStorage.getItem("isOnboardingDone");
    if (!isOnboardingDone) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const mapRef = useRef<MapRef | null>(null);
  const mapRefCallback = useCallback((ref: MapRef | null) => {
    if (ref !== null) {
      //Set the actual ref we use elsewhere
      mapRef.current = ref;
      //Add language control that updates map text i18n based on browser preferences
      const language = new MapboxLanguage();
      mapRef.current.addControl(language);
    }
  }, []);

  return (
    <>
      <div className="relative flex h-full w-full flex-col justify-between">
        <div
          className={[
            "absolute inset-0 border-2 border-app-500",
            isHoveringFeature ? "[&_canvas]:cursor-pointer" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {!!mapboxAccessToken && (
            <MapProvider>
              <Map
                ref={mapRefCallback}
                mapboxAccessToken={mapboxAccessToken}
                initialViewState={initialViewState}
                reuseMaps
                // locale={{ fr }}
                id="maproot"
                interactiveLayerIds={[
                  "shops_include",
                  "shops_exclude",
                  "poi-label",
                  "symbol",
                  "city-label",
                ]}
                onMouseMove={(e) => {
                  setIsHoveringFeature(!!e.features?.length);
                }}
                onClick={(e) => {
                  if (e.features?.length) {
                    const feature = e.features[0] as any;
                    if (!!feature.properties.id) {
                      const { id } = feature.properties;
                      navigate(
                        `/${params.product}/${id}?${searchParams.toString()}`,
                      );
                    } else if (
                      feature.properties?.type === "Bakery" ||
                      feature.properties?.class === "food_and_drink"
                    ) {
                      const name = feature.properties?.name;
                      const lngLat = e.lngLat;
                      navigate(
                        `/${params.product}/new-shop?name=${name}&coordinates=${lngLat.lat},${lngLat.lng}`,
                      );
                    }
                  }
                }}
                onContextMenu={(e) => {
                  const lngLat = e.lngLat;
                  navigate(
                    `/${params.product}/new-shop?coordinates=${lngLat.lat},${lngLat.lng}`,
                  );
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
              >
                <MapImage>
                  <Source
                    id="shops_include"
                    type="geojson"
                    data={geojson_included_by_filters}
                    cluster
                    clusterMaxZoom={14}
                    clusterRadius={50}
                  >
                    <Layer /* Layer for the clusters */
                      id="clusters"
                      type="circle"
                      source="shops_include"
                      filter={["has", "point_count"]}
                      paint={{
                        "circle-color": "#FFBB01",
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#000000",
                        "circle-radius": [
                          "step",
                          ["get", "point_count"],
                          20,
                          100,
                          30,
                          750,
                          40,
                        ],
                      }}
                    />
                    <Layer /* Layer for the cluster count labels */
                      id="cluster-count"
                      type="symbol"
                      source="shops_include"
                      filter={["has", "point_count"]}
                      layout={{
                        "text-field": "{point_count_abbreviated}",
                        "text-font": [
                          "DIN Offc Pro Medium",
                          "Arial Unicode MS Bold",
                        ],
                        "text-size": 12,
                      }}
                    />

                    <Layer
                      id="shops_include"
                      type="symbol"
                      layout={{
                        "icon-image": [
                          "case",
                          ["==", ["get", "is_active_shop"], 1],
                          "marker-full-black",
                          ["==", ["get", "is_industrial"], 1],
                          "marker-gray",
                          ["==", ["get", "is_home_made"], 1],
                          "marker-black",
                          ["to-boolean", ["get", "has_review"]],
                          "marker-black",
                          "marker-white",
                        ],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-size": 0.2,
                        "icon-offset": [0, -75],
                        "symbol-sort-key": ["get", "sort_key"],
                      }}
                      filter={["!", ["has", "point_count"]]}
                      paint={{
                        "icon-opacity": [
                          "case",
                          ["==", ["get", "is_active_shop"], 1], // Check if shop is active
                          1,
                          ["==", ["get", "is_included_by_filters"], 1],
                          1,
                          0.15,
                        ],
                      }}
                    />
                  </Source>
                  <Source
                    id="shops_exclude"
                    type="geojson"
                    data={geojson_excluded_by_filters}
                  >
                    <Layer
                      id="shops_exclude"
                      type="symbol"
                      layout={{
                        "icon-image": [
                          "case",
                          ["==", ["get", "is_active_shop"], 1],
                          "marker-full-black",
                          ["==", ["get", "is_industrial"], 1],
                          "marker-gray",
                          ["==", ["get", "is_home_made"], 1],
                          "marker-black",
                          ["to-boolean", ["get", "has_review"]],
                          "marker-black",
                          "marker-white",
                        ],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-size": 0.2,
                        "icon-offset": [0, -75],
                        "symbol-sort-key": ["get", "sort_key"],
                      }}
                      filter={[
                        "all",
                        ["!", ["has", "point_count"]],
                        ["!=", ["get", "is_included_by_filters"], true],
                        [">=", ["zoom"], 11],
                      ]}
                      paint={{
                        "icon-opacity": [
                          "case",
                          ["==", ["get", "is_active_shop"], 1], // Check if shop is active
                          1,
                          ["==", ["get", "is_included_by_filters"], 1],
                          1,
                          0.15,
                        ],
                      }}
                    />
                  </Source>
                </MapImage>
                <NavigationControl
                  showCompass={false}
                  showZoom={false}
                  visualizePitch={true}
                />
                <GeolocateControl
                  positionOptions={{ enableHighAccuracy: true }}
                  position="bottom-right"
                  trackUserLocation={true}
                  // style={{
                  //   // top: 80,
                  //   position: "relative",
                  //   marginBottom: 80,
                  // }}
                />
              </Map>
            </MapProvider>
          )}
        </div>
        <BurgerMenu
          mapRef={mapRef}
          total={total}
          setIsOnboardingOpen={setIsOnboardingOpen}
          user_id={user_id}
          geojson_included_by_filters={geojson_included_by_filters}
        />

        <Outlet />
      </div>
      <Onboarding
        open={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          window.localStorage.setItem("isOnboardingDone", "true");
        }}
      />
    </>
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentParams,
  nextParams,
  currentUrl,
  nextUrl,
}) => {
  if (!!currentParams.shopId && !nextParams.shopId) {
    return true;
  }
  // if searchparms size differ, then we need to revalidate

  if (
    Array.from(currentUrl.searchParams).length !==
    Array.from(nextUrl.searchParams).length
  ) {
    return true;
  }
  return false;
};
