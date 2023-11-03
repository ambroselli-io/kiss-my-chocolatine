import { Form, Link, useParams } from "@remix-run/react";
import type { MapRef } from "react-map-gl";
import { useState } from "react";
import Cookies from "js-cookie";
import { ClientOnly } from "remix-utils/client-only";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import ButtonArrowMenu from "~/components/ButtonArrowMenu";
import { makeAReferral, newFeedback } from "~/utils/emails";
import AboutOneActionOneShare from "~/components/AboutOneActionOneShare";
import ChocolatinesFilters from "~/components/ChocolatinesFilters";
import MyCurrentLocation from "~/components/MyCurrentLocation";
import type { CustomFeatureCollection } from "~/types/geojson";

interface ChocolatinesMenuProps {
  mapRef: React.MutableRefObject<MapRef | null>;
  setIsOnboardingOpen: (isOpen: boolean) => void;
  user_id: string | undefined;
  total: number;
  geojson: CustomFeatureCollection;
}

export default function ChocolatinesMenu({
  mapRef,
  setIsOnboardingOpen,
  user_id,
  total,
  geojson,
}: ChocolatinesMenuProps) {
  const [showMore, setShowMore] = useState(false);
  const params = useParams();

  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

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
                All the <b>{chocolatineName}</b> from the world 🌍{" "}
                <small className="opacity-30">
                  Well, it's {total} for now, but the world is coming step by
                  step 🤜
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
                  <summary>Don't like the word "{chocolatineName}"?</summary>
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
                      All the shops data - name, address, geo, opening hours,
                      etc.
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
                          information... Please <u>click here</u> to shoot us an
                          email!
                        </a>
                      )}
                    </ClientOnly>
                  </div>
                </details>
                {!!user_id ? (
                  <Form method="post" action="/action/logout">
                    <button
                      type="submit"
                      className="mr-auto px-4 py-2"
                      onClick={() => {
                        // reload the page to get the new data
                        window.location.reload();
                      }}
                    >
                      Log out
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
                to="./new-shop"
                className="absolute bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border-4 bg-app-500 text-3xl font-bold drop-shadow-sm"
              >
                <div className="absolute m-auto h-1 w-1/2 bg-gray-800" />
                <div className="absolute m-auto h-1 w-1/2 rotate-90 bg-gray-800" />
              </Link>
            </>
          )}
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
            className={[
              "absolute bottom-20 right-4 z-50 drop-shadow-sm",
              params.shopId ? "hidden" : "",
            ].join(" ")}
          />
        </>
      )}
    </ClientOnly>
  );
}
