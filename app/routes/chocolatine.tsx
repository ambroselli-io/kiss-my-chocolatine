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
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

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

export const loader = async ({ params }: LoaderFunctionArgs) => {
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

  return {
    initialViewState: {
      longitude,
      latitude,
      zoom: 12,
    },
    data: {
      type: "FeatureCollection",
      features: chocolatines
        .map((chocolatine) => {
          const shop = shops.find(
            (shop) => shop.identifier === chocolatine.belongsTo.identifier,
          );
          if (!shop) {
            return null;
          }
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [shop.geo.longitude, shop.geo.latitude],
            },
            properties: {
              identifier: shop.identifier,
              name: shop.name,
              is_active_shop: shop.identifier === params?.shopSlug ? 1 : 0,
              address: shop.address,
              telephone: shop.telephone,
              url: shop.url,
              description: shop.description,
              openingHoursSpecification: shop.openingHoursSpecification,
              servesCuisine: shop.servesCuisine,
              priceRange: shop.priceRange,
              paymentAccepted: shop.paymentAccepted,
              additionalType: shop.additionalType,
              chocolatine_sort_key: chocolatine.reviews.length > 0 ? 1 : 0, // 1 for with reviews, 0 for without
              chocolatine_hasreview: chocolatine.reviews.length > 0,
              chocolatine_hasprice: !!chocolatine.offers?.price,
              chocolatine_hasingredients: !!chocolatine.additionalType.find(
                (t) => t.name === "Ingredients",
              )?.value?.length,
            },
          };
        })
        .filter(Boolean),
    },
  };
};
// https://www.iletaitunefoislapatisserie.com/2013/04/pains-au-chocolat.html
export default function App() {
  let { initialViewState, data } = useLoaderData();
  const [mapboxAccessToken, setMapboxAccessToken] = useState("");
  const [isHoveringFeature, setIsHoveringFeature] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const params = useParams();

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
                    navigate(`/chocolatine/${identifier}`);
                  }
                }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
              >
                <MapImage>
                  <Source id="shops" type="geojson" data={data}>
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
                        "symbol-sort-key": [
                          "case",
                          ["==", ["get", "is_active_shop"], 1],
                          [
                            "+",
                            ["*", 1000, ["get", "is_active_shop"]],
                            ["get", "chocolatine_sort_key"],
                          ],
                          ["get", "chocolatine_sort_key"],
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
                    className="cursor-pointer"
                    onClick={() => setIsOnboardingOpen(true)}
                  >
                    All the <b>{chocolatineName}</b> from the world 🌍
                  </h1>
                  <ButtonArrowMenu
                    onClick={() => setShowMore(!showMore)}
                    isActive={showMore}
                  />
                </div>
                {showMore && (
                  <div className="flex flex-col gap-y-3 overflow-y-auto border-t border-t-gray-200 px-4 py-2">
                    <CompanyStructure />
                    <details>
                      <summary>
                        <a
                          href={makeAReferral()}
                          className="inline-flex items-center gap-x-2 font-medium underline decoration-[#FFBB01]"
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
                    <details>
                      <summary className="cursor-pointer font-medium underline decoration-[#FFBB01]">
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
}) => {
  if (currentParams.shopSlug !== nextParams.shopSlug) return true;
  return false;
};
