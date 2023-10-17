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
  useOutletContext,
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
import { useEffect, useState } from "react";
import MapImage from "~/components/MapImage";
import ButtonArrowMenu from "~/components/ButtonArrowMenu";
import Onboarding from "~/components/Onboarding";
import shops from "~/data/shops.json";
import chocolatines from "~/data/chocolatines.json";
import { makeAReferral, newShopEmail } from "~/utils/emails";
import Cookies from "js-cookie";
import { ClientOnly } from "remix-utils/client-only";
import CompanyStructure from "~/components/CompanyStructure";
import ChocolatinesFilters from "~/components/ChocolatinesFilters";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { isChocolatineIncludedByFilters } from "~/utils/isIncludedByFilters";

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
  const damSquare = {
    longitude: 4.891332614225945,
    latitude: 52.373091430357476,
  };
  const currentShop = shops.find((f) => f.identifier === params?.shopSlug);
  const { longitude, latitude } = (() => {
    if (!params.shopSlug) return damSquare;
    const shopGeo = currentShop?.geo;
    if (!shopGeo) return damSquare;
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

  return {
    initialViewState: {
      longitude,
      latitude,
      zoom: 12,
    },
    chocolatines,
    geojson: {
      type: "FeatureCollection",
      features: chocolatines
        .map((chocolatine) => {
          const shop = shops.find(
            (shop) => shop.identifier === chocolatine.belongsTo.identifier,
          );
          if (!shop) {
            return null;
          }

          const isActiveShop = shop.identifier === params?.shopSlug;
          const isIncludedByFilters = isChocolatineIncludedByFilters(
            chocolatine,
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
              chocolatine_sort_key: isActiveShop
                ? 4
                : isIncludedByFilters
                ? 3
                : chocolatine.reviews.length
                ? 2
                : 1,
              chocolatine_hasreview: chocolatine.reviews.length > 0,
            },
          };
        })
        .filter(Boolean),
    },
  };
};
// https://www.iletaitunefoislapatisserie.com/2013/04/pains-au-chocolat.html
export default function App() {
  let { initialViewState, geojson } = useLoaderData();
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

  return (
    <>
      <div className="relative flex h-full w-full flex-col justify-between sm:justify-start">
        <div
          className={[
            "absolute inset-0",
            isHoveringFeature ? "[&_canvas]:cursor-pointer" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {!!mapboxAccessToken && (
            <MapProvider>
              <Map
                mapboxAccessToken={mapboxAccessToken}
                initialViewState={initialViewState}
                reuseMaps
                id="maproot"
                style={{ border: "3px solid #FFBB01" }}
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
                          ["to-boolean", ["get", "chocolatine_hasreview"]],
                          "marker-black",
                          "marker-white",
                        ],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-size": 0.2,
                        "icon-offset": [0, -75],
                        "symbol-sort-key": ["get", "chocolatine_sort_key"],
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
                    className="max-w-lg cursor-pointer"
                    onClick={() => setIsOnboardingOpen(true)}
                  >
                    All the <b>{chocolatineName}</b> from the world 🌍{" "}
                    <small className="opacity-30">
                      Well, it's Amsterdam only because we're living there, but
                      the world is coming step by step 🤜
                    </small>
                  </h1>
                  <ButtonArrowMenu
                    onClick={() => setShowMore(!showMore)}
                    isActive={showMore}
                  />
                </div>
                {showMore && (
                  <div className="flex flex-col overflow-y-auto border-t border-t-gray-200">
                    <ChocolatinesFilters />
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
                    <CompanyStructure />
                    <details className="border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2">
                      <summary className="cursor-pointer">
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
                  </div>
                )}
              </div>

              {!params.shopSlug && (
                <a
                  href={newShopEmail()}
                  className="absolute bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFBB01] text-3xl font-bold text-white drop-shadow-sm"
                >
                  <div className="absolute m-auto h-1 w-1/2 bg-white" />
                  <div className="absolute m-auto h-1 w-1/2 rotate-90 bg-white" />
                </a>
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
  if (currentParams.shopSlug !== nextParams.shopSlug) return true;
  // if searchparms size differ, then we need to revalidate
  if (currentUrl.searchParams.size !== nextUrl.searchParams.size) return true;
  return false;
};
