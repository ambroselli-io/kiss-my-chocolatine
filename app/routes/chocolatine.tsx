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
import type { Shop } from "@prisma/client";
import type { SchemaOrgShop } from "../types/schemaOrgShop";
import { useEffect, useRef, useState } from "react";
import MapImage from "~/components/MapImage";
import Onboarding from "~/components/Onboarding";
import {
  isChocolatineIncludedByFilters,
  availableFilters,
} from "~/utils/isIncludedByFilters.server";
import type { CustomFeature, CustomFeatureCollection } from "~/types/geojson";
import type { ChocolatineFiltersInterface } from "~/types/chocolatineCriterias";
import { prisma } from "~/db/prisma.server";
import { getUserIdFromCookie } from "~/services/auth.server";
import ChocolatinesMenu from "~/components/ChocolatinesMenu";
import { Record } from "@prisma/client/runtime/library";
import { shopFromRowToSchemaOrg } from "~/utils/schemaOrg";

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
  shopSchemaOrg: Array<SchemaOrgShop>;
};

export const meta: MetaFunction = ({ matches, data }: MetaArgs) => {
  const parentMeta = matches[matches.length - 2].meta ?? [];
  const shopSchemaOrg = (data as loaderData)
    .shopSchemaOrg as Array<SchemaOrgShop>;

  return [
    ...parentMeta,
    ...shopSchemaOrg.map((shop) => ({
      "script:ld+json": shop,
    })),
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const europe = {
    longitude: 2.2137,
    latitude: 46.6034,
    zoom: 4,
  };

  const shops = await prisma.shop.findMany({
    include: {
      chocolatine: true,
    },
  });

  const shopObject: Record<string, Shop> = {};
  for (const shop of shops) {
    shopObject[shop.id] = shop;
  }

  const currentShop = shops.find((f) => f.id === params?.shop_id);
  const initialViewState = (() => {
    if (!params.shopId) return europe;
    if (!currentShop) return europe;
    return {
      longitude: currentShop.longitude as number,
      latitude: currentShop.latitude as number,
      zoom: 14,
    };
  })();

  /* filters */
  const url = new URL(request.url);
  const filters: ChocolatineFiltersInterface = {};
  for (let searchParamKey of url.searchParams.keys()) {
    if (!availableFilters[searchParamKey]) continue;
    const filterKey = searchParamKey as keyof ChocolatineFiltersInterface;
    filters[filterKey] = url.searchParams.getAll(filterKey as string);
  }

  const features = shops
    .map((shop): CustomFeature | null => {
      if (!shop.longitude) return null;
      if (!shop.latitude) return null;

      const { chocolatine } = shop;

      const isActiveShop = shop.id === params?.shop_id;
      const isIncludedByFilters = isChocolatineIncludedByFilters(
        filters,
        shop,
        chocolatine,
      );

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [shop.longitude, shop.latitude],
        },
        properties: {
          id: shop.id,
          is_active_shop: isActiveShop ? 1 : 0,
          is_included_by_filters: isIncludedByFilters ? 1 : 0,
          sort_key: isActiveShop
            ? 4
            : isIncludedByFilters
            ? 3
            : chocolatine?.has_been_reviewed_once
            ? 2
            : 1,
          has_review: !!chocolatine?.has_been_reviewed_once,
        },
      };
    })
    .filter(Boolean)
    .map((feature) => {
      feature = feature as CustomFeature;
      return feature;
    });

  const featuresIncludedByFilters = features.filter(
    (feature) => feature.properties.is_included_by_filters === 1,
  );
  const shopSchemaOrg = features.map((feature) => {
    return shopFromRowToSchemaOrg(shopObject[feature.properties.id]);
  });

  const data: loaderData = {
    user_id: await getUserIdFromCookie(request, { optional: true }),
    initialViewState,
    total: shops.length,
    shopSchemaOrg,
    geojson_included_by_filters: {
      type: "FeatureCollection",
      features: featuresIncludedByFilters,
    },
    geojson_excluded_by_filters: {
      type: "FeatureCollection",
      features: features.filter(
        (feature) => feature.properties.is_included_by_filters === 0,
      ),
    },
  };
  return data;
};
// https://www.iletaitunefoislapatisserie.com/2013/04/pains-au-chocolat.html
export default function App() {
  let {
    user_id,
    initialViewState,
    total,
    geojson_included_by_filters,
    geojson_excluded_by_filters,
  } = useLoaderData<typeof loader>();
  const [mapboxAccessToken, setMapboxAccessToken] = useState("");
  const [isHoveringFeature, setIsHoveringFeature] = useState(false);
  const [searchParams] = useSearchParams();

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

  return (
    <>
      <div className="relative flex h-full w-full flex-col justify-between sm:justify-start">
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
                ref={mapRef}
                mapboxAccessToken={mapboxAccessToken}
                initialViewState={initialViewState}
                reuseMaps
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
                  console.log(e);
                  console.log(e.features);
                  if (e.features?.length) {
                    const feature = e.features[0] as any;
                    if (!!feature.properties.id) {
                      const { id } = feature.properties;
                      navigate(`/chocolatine/${id}?${searchParams.toString()}`);
                    } else if (
                      feature.properties?.type === "Bakery" ||
                      feature.properties?.class === "food_and_drink"
                    ) {
                      const name = feature.properties?.name;
                      const lngLat = e.lngLat;
                      navigate(
                        `/chocolatine/new-shop?name=${name}&coordinates=${lngLat.lat},${lngLat.lng}`,
                      );
                    }
                  }
                }}
                onContextMenu={(e) => {
                  // log the coordinates like: { longitude: -122.084990, latitude: 37.426929}
                  const lngLat = e.lngLat;
                  // console.log(e);
                  // console.log(e.features);
                  navigate(
                    `/chocolatine/new-shop?coordinates=${lngLat.lat},${lngLat.lng}`,
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
        <ChocolatinesMenu
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
  if (currentParams.shopId !== nextParams.shopId) {
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
