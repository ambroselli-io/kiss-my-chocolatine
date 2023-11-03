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
} from "react-map-gl";
import type { MapRef } from "react-map-gl";
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

export const meta: MetaFunction = ({ matches }: MetaArgs) => {
  const parentMeta = matches[matches.length - 2].meta ?? [];

  return [
    ...parentMeta,
    // ...chocolatines
    //   .map((chocolatine) => {
    //     const shop = shops.find(
    //       (shop) => shop.id === chocolatine.belongsTo.id,
    //     );
    //     if (!shop) return null;
    //     return shop;
    //   })
    //   .filter(Boolean)
    //   .map((shop) => ({ "script:ld+json": shop })),
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

  const currentShop = shops.find((f) => f.id === params?.shop_id);
  const initialViewState = (() => {
    if (!params.shopId) return europe;
    if (!currentShop) return europe;
    return {
      longitude: currentShop.longitude,
      latitude: currentShop.latitude,
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

  const data: {
    initialViewState: any;
    total: number;
    geojson: CustomFeatureCollection;
    user_id?: string;
  } = {
    user_id: await getUserIdFromCookie(request, { optional: true }),
    initialViewState,
    total: shops.length,
    geojson: {
      type: "FeatureCollection",
      features: shops
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
        }),
    },
  };
  return data;
};
// https://www.iletaitunefoislapatisserie.com/2013/04/pains-au-chocolat.html
export default function App() {
  let { user_id, initialViewState, total, geojson } =
    useLoaderData<typeof loader>();
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
                interactiveLayerIds={["shops"]}
                onMouseMove={(e) => {
                  setIsHoveringFeature(!!e.features?.length);
                }}
                onClick={(e) => {
                  if (e.features?.length) {
                    const feature = e.features[0] as any;
                    const { id } = feature.properties;
                    navigate(`/chocolatine/${id}?${searchParams.toString()}`);
                  }
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
              >
                <MapImage>
                  <Source
                    id="shops"
                    type="geojson"
                    data={geojson}
                    cluster
                    clusterMaxZoom={14}
                    clusterRadius={50}
                  >
                    <Layer /* Layer for the clusters */
                      id="clusters"
                      type="circle"
                      source="shops"
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
                      source="shops"
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
                      id="shops"
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
                </MapImage>
                <NavigationControl
                  showCompass={false}
                  showZoom={false}
                  visualizePitch={true}
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
          geojson={geojson}
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
  if (currentParams.shop_id !== nextParams.shop_id) return true;
  // if searchparms size differ, then we need to revalidate

  if (
    Array.from(currentUrl.searchParams).length !==
    Array.from(nextUrl.searchParams).length
  )
    return true;
  return false;
};
