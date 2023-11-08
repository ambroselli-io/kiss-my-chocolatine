import { Form, Link, useParams } from "@remix-run/react";
import type { MapRef } from "react-map-gl";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import ButtonArrowMenu from "~/components/ButtonArrowMenu";
import { makeAReferral, newFeedback } from "~/utils/emails";
import AboutOneActionOneShare from "~/components/AboutOneActionOneShare";
import ChocolatinesFilters from "~/components/ChocolatinesFilters";
import MyCurrentLocation from "~/components/MyCurrentLocation";
import type { CustomFeatureCollection } from "~/types/geojson";
import useChocolatineName from "~/utils/useChocolatineName";
import { mapActionToShares } from "~/utils/mapActionToShares";

interface ChocolatinesMenuProps {
  mapRef: React.MutableRefObject<MapRef | null>;
  setIsOnboardingOpen: (isOpen: boolean) => void;
  user_id: string | undefined;
  total: number;
  geojson_included_by_filters: CustomFeatureCollection;
}

export default function ChocolatinesMenu({
  mapRef,
  setIsOnboardingOpen,
  user_id,
  total,
  geojson_included_by_filters,
}: ChocolatinesMenuProps) {
  const [showMore, setShowMore] = useState(false);
  const params = useParams();

  const { chocolatineName, chocolatinesName } = useChocolatineName();

  return (
    <ClientOnly>
      {() => (
        <>
          <div className="relative flex max-h-[85vh] shrink-0 cursor-pointer flex-col bg-white drop-shadow-sm ">
            <div className="flex items-center justify-between px-4 py-2 ">
              <h1
                className="max-w-lg cursor-pointer md:max-w-none"
                onClick={() => setIsOnboardingOpen(true)}
              >
                Les <b>{chocolatinesName}</b> du monde entier 🌍{" "}
                <small className="opacity-30">
                  Bon, il y en {total} pour le moment, mais le monde entier
                  arrive pas après pas 🤜
                </small>
              </h1>
              <ButtonArrowMenu
                onClick={() => setShowMore(!showMore)}
                isActive={showMore}
              />
            </div>
            {showMore && (
              <div className="flex flex-col overflow-y-auto border-t border-t-gray-200">
                <ChocolatinesFilters
                  geojson_included_by_filters={geojson_included_by_filters}
                />
                <Link
                  to="/chocolatine/referral"
                  className="inline-flex items-center gap-x-2 border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2 font-bold"
                  onClick={() => {
                    setShowMore(false);
                  }}
                >
                  Invitez vos amis et gagnez{" "}
                  {mapActionToShares.USER_REFERRAL_CREATER}
                </Link>
                <Link
                  to="/shareholders"
                  className="inline-flex items-center gap-x-2 border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2 font-bold"
                  onClick={() => {
                    setShowMore(false);
                  }}
                >
                  Regardez combien d'actions vous avez 🤑
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-x-2 border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2 text-left"
                  aria-label="Change the name of the chocolatine"
                  onClick={() => {
                    setShowMore(false);
                    setIsOnboardingOpen(true);
                  }}
                >
                  Vous n'aimez pas "{chocolatineName}"?
                </button>
                <a
                  href="https://github.com/ambroselli-io/kiss-my-chocolatine"
                  className="inline-flex items-center gap-x-2 border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2 "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code source 🤓
                  <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                </a>
                <Link
                  to="/chocolatine/feedback"
                  className="inline-block items-center gap-x-2 border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2"
                  onClick={() => {
                    setShowMore(false);
                  }}
                >
                  Un commentaire?
                </Link>
                <Link
                  to="/blog"
                  className="inline-block items-center gap-x-2 border-b border-b-[#FFBB01] border-opacity-50 px-4 py-2"
                  onClick={() => {
                    setShowMore(false);
                  }}
                >
                  Blog
                </Link>
                {!!user_id ? (
                  <Form method="post" action="/action/logout">
                    <button
                      type="submit"
                      className="mr-auto px-4 py-2"
                      onClick={() => {
                        // reload the page to get the new data
                        setTimeout(() => {
                          window.location.reload();
                        }, 500);
                      }}
                    >
                      Déconnexion
                    </button>
                  </Form>
                ) : (
                  <Link
                    to="/chocolatine/register"
                    className="mr-auto px-4 py-2"
                    onClick={() => {
                      setShowMore(false);
                    }}
                  >
                    Log in
                  </Link>
                )}
              </div>
            )}
          </div>

          {!params.shopId && (
            <>
              <Link
                to="/chocolatine/new-shop"
                className="absolute bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border-4 bg-app-500 text-3xl font-bold drop-shadow-sm"
              >
                <div className="absolute m-auto h-1 w-1/2 bg-gray-800" />
                <div className="absolute m-auto h-1 w-1/2 rotate-90 bg-gray-800" />
              </Link>
            </>
          )}
          {/* <MyCurrentLocation
            onSetCurrentLocation={({ lat, lng }) => {
              // fly with default options to null island
              mapRef?.current?.flyTo({
                center: [lng, lat],
                zoom: 13,
                speed: 10,
                curve: 1,
              });
            }}
            className={[
              "absolute bottom-20 right-4 z-50 drop-shadow-sm",
              params.shopId ? "hidden" : "",
            ].join(" ")}
          /> */}
        </>
      )}
    </ClientOnly>
  );
}
