import type {
  MetaFunction,
  MetaArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Layer,
  Map,
  MapProvider,
  NavigationControl,
  Source,
} from "react-map-gl";
import { useEffect, useState } from "react";
import MapImage from "~/components/MapImage";
import Onboarding from "~/components/Onboarding";
import shops from "~/data/shops.json";
import chocolatines from "~/data/chocolatines.json";

export const meta: MetaFunction = ({ params, data }: MetaArgs) => {
  return [
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
  const { longitude, latitude } = (() => {
    if (!params.shopSlug) return damSquare;
    const shopGeo = shops.find((f) => f.identifier === params.shopSlug)?.geo;
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
  const { initialViewState, data } = useLoaderData();
  const [mapboxAccessToken, setMapboxAccessToken] = useState("");
  const [isHoveringFeature, setIsHoveringFeature] = useState(false);
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
  const chocolatineName =
    typeof window !== "undefined"
      ? window.localStorage.getItem("chocolatine-name")
      : "pain au chocolat";

  return (
    <>
      <div className="flex h-full w-full flex-col-reverse sm:flex-col">
        <h1 className="absolute bottom-0 left-0 right-0 z-10 shrink-0 bg-white px-4 py-2 drop-shadow-sm sm:relative">
          THE Ultimate{" "}
          <b onClick={() => setIsOnboardingOpen(true)}>{chocolatineName}</b>{" "}
          showdown: the Good, the Bad, and the Ugly 🤔🍫🇫🇷
        </h1>

        <div
          className={[
            "relative flex w-full flex-1 flex-col overflow-hidden sm:flex-row",
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
                          ["to-boolean", ["get", "chocolatine_hasreview"]],
                          "marker-black",
                          "marker-white",
                        ],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-size": 0.2,
                        "icon-offset": [0, -75],
                        "symbol-sort-key": ["get", "chocolatine_sort_key"], // Add this line
                      }}
                    />
                  </Source>
                </MapImage>
                <NavigationControl
                  showCompass={false}
                  showZoom={true}
                  visualizePitch={true}
                />
              </Map>
              <Outlet />
            </MapProvider>
          )}
        </div>
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
