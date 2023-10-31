import type {
  MetaFunction,
  MetaArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import {
  Link,
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
} from "react-map-gl";
import type { MapRef } from "react-map-gl";
import { useEffect, useRef, useState } from "react";
import MapImage from "~/components/MapImage";
import ButtonArrowMenu from "~/components/ButtonArrowMenu";
import Onboarding from "~/components/Onboarding";
import shops from "~/data/shops.json";
import chocolatines from "~/data/chocolatines.json";
import { makeAReferral, newFeedback, newShopEmail } from "~/utils/emails";
import Cookies from "js-cookie";
import { ClientOnly } from "remix-utils/client-only";
import AboutOneActionOneShare from "~/components/AboutOneActionOneShare";
import ChocolatinesFilters from "~/components/ChocolatinesFilters";
import MyCurrentLocation from "~/components/MyCurrentLocation";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { isChocolatineIncludedByFilters } from "~/utils/isIncludedByFilters";
import type { Shop } from "~/types/shop";
import type { CustomFeature, CustomFeatureCollection } from "~/types/geojson";
import { prisma } from "~/db/prisma.server";

export const meta: MetaFunction = ({ matches }: MetaArgs) => {
  const parentMeta = matches[matches.length - 2].meta ?? [];

  return [
    ...parentMeta,
    ...chocolatines
      .map((chocolatine) => {
        const shop = shops.find(
          (shop) => shop.identifier === chocolatine.belongsTo.identifier,
        );
        if (!shop) return null;
        return shop;
      })
      .filter(Boolean)
      .map((shop) => ({ "script:ld+json": shop })),
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const europe = {
    longitude: 2.2137,
    latitude: 46.6034,
  };
  const currentShop = shops.find((f) => f.identifier === params?.shopId);
  const { longitude, latitude } = (() => {
    if (!params.shopId) return europe;
    const shopGeo = currentShop?.geo;
    if (!shopGeo) return europe;
    return shopGeo;
  })();

  /* filters */
  const url = new URL(request.url);
  // const filters = Array.from(url.searchParams).map(
  //   ([key, value]) => `${key}-${value}`,
  // );
  const filters: any = {};
  for (let key of url.searchParams.keys()) {
    filters[key] = url.searchParams.getAll(key);
  }

  const data: {
    initialViewState: any;
    total: number;
    geojson: CustomFeatureCollection;
  } = {
    initialViewState: {
      longitude,
      latitude,
      zoom: 4,
    },
    total: chocolatines.length,
    geojson: {
      type: "FeatureCollection",
      features: chocolatines
        .map((chocolatine): CustomFeature => {
          const shop = shops.find(
            (shop) => shop.identifier === chocolatine.belongsTo.identifier,
          ) as Shop;

          const isActiveShop = shop.identifier === params?.shopId;
          const isIncludedByFilters = isChocolatineIncludedByFilters(
            chocolatine,
            shop,
            filters,
          );

          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [shop.geo.longitude, shop.geo.latitude],
            },
            properties: {
              identifier: shop.identifier,
              is_active_shop: isActiveShop ? 1 : 0,
              is_included_by_filters: isIncludedByFilters ? 1 : 0,
              sort_key: isActiveShop
                ? 4
                : isIncludedByFilters
                ? 3
                : chocolatine.reviews.length
                ? 2
                : 1,
              has_review: chocolatine.reviews.length > 0,
            },
          };
        })
        .filter(Boolean),
    },
  };
  return data;
};
// https://www.iletaitunefoislapatisserie.com/2013/04/pains-au-chocolat.html
export default function App() {
  let { initialViewState, total, geojson } = useLoaderData<typeof loader>();
  const [mapboxAccessToken, setMapboxAccessToken] = useState("");
  const [isHoveringFeature, setIsHoveringFeature] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const params = useParams();
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
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  const mapRef = useRef<MapRef>();

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
                    const { identifier } = feature.properties;
                    navigate(
                      `/chocolatine/${identifier}?${searchParams.toString()}`,
                    );
                  }
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
              >
                <MapImage>
                  <Source id="shops" type="geojson" data={geojson}>
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
                      paint={{
                        "icon-opacity": [
                          "case",
                          ["==", ["get", "is_active_shop"], 1], // Check if shop is active
                          1,
                          ["==", ["get", "is_included_by_filters"], 1],
                          1,
                          0.35,
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
        <ClientOnly>
          {() => (
            <>
              <div className="relative flex max-h-[85vh] shrink-0 cursor-pointer flex-col bg-white drop-shadow-sm ">
                <div className="flex items-center justify-between px-4 py-2 ">
                  <h1
                    className="max-w-lg cursor-pointer md:max-w-none"
                    onClick={() => setIsOnboardingOpen(true)}
                  >
                    All the <b>{chocolatineName}</b> from the world 🌍{" "}
                    <small className="opacity-30">
                      Well, it's {total} for now, but the world is coming step
                      by step 🤜
                    </small>
                  </h1>
                  <ButtonArrowMenu
                    onClick={() => setShowMore(!showMore)}
                    isActive={showMore}
                  />
                </div>
                {showMore && (
                  <div className="flex flex-col overflow-y-auto border-t border-t-gray-200">
                    <ChocolatinesFilters geojson={geojson} />
                    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
                      <summary>
                        <a
                          href={makeAReferral()}
                          className="inline-flex items-center gap-x-2 font-bold"
                        >
                          Make a referral and earn one share
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      </summary>
                      <div className="mt-2 flex flex-col gap-2 px-2">
                        <p>
                          If you bring a new user to the platform, you earn one
                          share - so does the new coming user.
                        </p>
                      </div>
                    </details>
                    <AboutOneActionOneShare />
                    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
                      <summary>
                        Don't like the word "{chocolatineName}"?
                      </summary>
                      <div className="mt-2 flex flex-col gap-2 px-2">
                        <button
                          type="button"
                          onClick={() => setIsOnboardingOpen(true)}
                          aria-label="Change the name of the chocolatine"
                        >
                          Click <u>here</u> to change its name.
                        </button>
                      </div>
                    </details>
                    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
                      <summary>Open Source</summary>
                      <div className="mt-2 flex flex-col divide-y divide-[#FFBB01] divide-opacity-20">
                        <a
                          href="https://github.com/ambroselli-io/kiss-my-chocolatine/blob/main/app/data/chocolatines.json"
                          className="inline-flex items-center gap-x-2 px-4 py-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          All the {chocolatineName} data - reviews, ingredients,
                          prices, etc.
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                        <a
                          href="https://github.com/ambroselli-io/kiss-my-chocolatine/blob/main/app/data/shops.json"
                          className="inline-flex items-center gap-x-2 px-4 py-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          All the shops data - name, address, geo, opening
                          hours, etc.
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                        <a
                          href="https://github.com/ambroselli-io/kiss-my-chocolatine"
                          className="inline-flex items-center gap-x-2 px-4 py-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          All the source code
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      </div>
                    </details>
                    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
                      <summary>Feedback</summary>
                      <div className="mt-2 flex flex-col gap-2 px-2">
                        <ClientOnly>
                          {() => (
                            <a href={newFeedback()} className="px-4 py-2">
                              Any feedback? Good, bad, review, wrong or missing
                              information... Please <u>click here</u> to shoot
                              us an email!
                            </a>
                          )}
                        </ClientOnly>
                      </div>
                    </details>
                    <button
                      type="submit"
                      formAction="/action/logout"
                      formMethod="POST"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>

              {!params.shopId && (
                <>
                  <Link
                    to="./new-shop"
                    className="absolute bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border-4 bg-app-500 text-3xl font-bold drop-shadow-sm"
                  >
                    <div className="absolute m-auto h-1 w-1/2 bg-gray-800" />
                    <div className="absolute m-auto h-1 w-1/2 rotate-90 bg-gray-800" />
                  </Link>
                  <MyCurrentLocation
                    onSetCurrentLocation={({ lat, lng }) => {
                      // fly with default options to null island
                      mapRef?.current?.flyTo({
                        center: [lng, lat],
                        zoom: 13,
                        speed: 10,
                        curve: 1,
                      });
                    }}
                    className="absolute bottom-20 right-4 z-50 drop-shadow-sm"
                  />
                </>
              )}
            </>
          )}
        </ClientOnly>
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
  if (currentParams.shopId !== nextParams.shopId) return true;
  // if searchparms size differ, then we need to revalidate

  if (
    Array.from(currentUrl.searchParams).length !==
    Array.from(nextUrl.searchParams).length
  )
    return true;
  return false;
};
