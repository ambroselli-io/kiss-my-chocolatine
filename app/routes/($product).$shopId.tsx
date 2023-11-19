import {
  redirect,
  type LoaderFunctionArgs,
  type MetaArgs,
  type MetaFunction,
} from "@remix-run/node";
import type { Shop, ChocolatineReview, Award } from "@prisma/client";
import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import Availability from "~/components/Availability";
import BalancedRate from "~/components/BalancedRate";
import { newFeedback, newIngredient } from "~/utils/emails";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect, useState } from "react";
import { prisma } from "~/db/prisma.server";
import { from020to22 } from "~/utils/review";
import useChocolatineName from "~/utils/useChocolatineName";
import { chocolatineFromRowToSchemaOrg } from "~/utils/schemaOrg";
import type { SchemaOrgChocolatine } from "~/types/schemaOrgChocolatine";
import { readableAwards, readablePositions } from "~/utils/awards";
import { readableHomemade } from "~/utils/homemade";
import ChartRadar from "~/components/ChartRadar";
import { fromShopToRadarData } from "~/utils/radarData";
import type { RadarData } from "~/utils/radarData";

export const meta: MetaFunction = ({ matches, data }: MetaArgs) => {
  const chocolatineSchemaOrg = (data as Record<string, SchemaOrgChocolatine>)
    .chocolatineSchemaOrg as SchemaOrgChocolatine;
  const shop = (data as Record<string, Shop>).shop as Shop;
  return [
    ...(matches[matches.length - 2].meta ?? []).filter((meta) => {
      if (meta.hasOwnProperty("title")) return false;
      if ("property" in meta && meta.property === "og:title") return false;
      if ("property" in meta && meta.property === "twitter:title") return false;
      return true;
    }),
    {
      title: `${shop?.name} | Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍`,
    },
    {
      property: "og:title",
      content: `${shop?.name} | Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍`,
    },
    {
      property: "twitter:title",
      content: `${shop?.name} | Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍`,
    },
    { "script:ld+json": chocolatineSchemaOrg, key: "chocolatine" },
  ];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const shopPopulated = await prisma.shop.findUnique({
    where: {
      id: params.shopId,
    },
    include: {
      chocolatineReviews: true,
      awards: {
        orderBy: {
          year: "desc",
        },
      },
    },
  });

  if (!shopPopulated) {
    return redirect("/404");
  }

  const { chocolatineReviews, awards, ...shop } = shopPopulated;

  const detailedReviews =
    chocolatineReviews?.filter((r: ChocolatineReview) => !!r.comment) ?? [];

  const radarData = fromShopToRadarData(shop);

  return {
    chocolatineSchemaOrg: chocolatineFromRowToSchemaOrg(
      shop as Shop,
      chocolatineReviews as Array<ChocolatineReview>,
    ),
    shop: shop as Shop,
    radarData: radarData as RadarData,
    awards: awards as Array<Award>,
    ingredients: [], // TODO
    detailedReviews,
  };
};

export default function ChocolatineAndShop() {
  const data = useLoaderData<typeof loader>();
  const { detailedReviews, awards, radarData } = data;
  const shop = data.shop as unknown as Shop;
  const fromCookies = useChocolatineName();
  const [chocolatineName, setChocolatineName] = useState("pain au chocolat");
  const [searchParams] = useSearchParams();
  const params = useParams();
  useEffect(() => {
    setChocolatineName(fromCookies.chocolatineName);
  }, []);

  return (
    <>
      <div
        id="drawer"
        className="border-t-1 relative z-20 flex h-[75vh] w-full max-w-screen-sm shrink-0 flex-col overflow-y-hidden rounded-t-3xl border-gray-300 bg-gray-900 shadow-2xl sm:z-0 sm:max-w-sm"
      >
        <h2 className="mt-4 bg-gray-900 px-4 text-xl font-semibold text-white">
          {shop.name}
        </h2>
        {["I think so", "Yes"].includes(shop.chocolatine_homemade) && (
          <h3 className="pb-2 pl-5 font-semibold text-app-500 opacity-90">
            🧑‍🍳 Artisanal
          </h3>
        )}
        {["I don't think so", "No"].includes(shop.chocolatine_homemade) && (
          <h3 className="pb-2 pl-5 font-semibold text-gray-500 opacity-90">
            🤖 Industriel
          </h3>
        )}
        <Link
          className="absolute right-2 top-2 font-light text-white"
          to={`/${params.product}?${searchParams.toString()}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              className="drop-shadow-sm"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Link>
        <div className="relative h-full w-full flex-col overflow-x-auto overflow-y-auto bg-white">
          <div className="mt-2 flex flex-col items-start justify-start gap-2 px-4 text-sm font-light not-italic text-[#3c4043]">
            <span
              aria-details="address"
              className="flex"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}&travelmode=walking`,
                  "_blank",
                );
              }}
            >
              <img src="/assets/pin-grey.svg" className="mr-3 w-5" />
              {!!shop.streetAddress ? (
                <>
                  {shop.streetAddress}
                  <br />
                  {shop.addresspostalCode} {shop.addressLocality}
                </>
              ) : (
                <>{shop.addressLocality}</>
              )}
            </span>
            <span aria-details="opening hours" className="flex text-sm">
              <img src="/assets/clock-grey.svg" className="mr-3 w-5" />
              {shop.openingHoursSpecification ? (
                <Availability shop={shop} />
              ) : (
                <Link to="./opening-hours" className="underline">
                  Horaires non renseignés
                </Link>
              )}
            </span>
            <span
              aria-details="opening hours"
              className="flex items-center text-sm"
            >
              <span className="mr-3 w-5 rounded-full text-center text-base font-medium text-gray-300">
                €
              </span>
              {shop.chocolatine_price ? (
                <>{shop.chocolatine_price.toFixed(2)}&thinsp;€</>
              ) : (
                "Prix non renseigné"
              )}
            </span>
          </div>
          <section className="w-full shrink-0 gap-y-4 overflow-y-auto px-4 pb-6">
            <div className="mb-2 mt-10 flex items-center justify-between">
              <h3 className="font-bold">A quoi cela ressemble-t-il?</h3>
              <ClientOnly>
                {() => (
                  <Link
                    to={`/${params.product}/${shop.id}/review`}
                    className="ml-auto text-xs"
                  >
                    🙋 Ajouter mon avis
                  </Link>
                )}
              </ClientOnly>
            </div>
            {!shop.chocolatine_has_been_reviewed_once ? (
              "Pas d'avis encore"
            ) : (
              <>
                <div className="flex h-60 w-full justify-center py-4">
                  <ChartRadar
                    color={
                      ["I don't think so", "No"].includes(
                        shop.chocolatine_homemade,
                      )
                        ? "#9da3ae"
                        : "#f5be41"
                    }
                    data={radarData}
                  />
                </div>
                <div className="ml-1 mt-4 flex flex-col text-sm">
                  <details className="mb-1 inline-flex">
                    <summary>Comment est la disposition du chocolat?</summary>
                    <p className="text-xs italic opacity-70">
                      superposé ou bien distribué?&nbsp;🖖
                    </p>
                  </details>
                  <BalancedRate
                    minCaption={"Superposé"}
                    maxCaption={"Sur les bords"}
                    color={
                      ["I don't think so", "No"].includes(
                        shop.chocolatine_homemade,
                      )
                        ? "#9da3ae"
                        : "#f5be41"
                    }
                    value={shop.chocolatine_average_chocolate_disposition}
                  />
                </div>
                <div className="ml-1 mt-4 flex flex-col text-sm">
                  <details className="mb-1 inline-flex">
                    <summary>En fin de compte, est-il bon?</summary>
                    <p className="text-xs italic opacity-70">
                      la seule note subjective ici - les autres sont
                      scientifiques&nbsp;🥸
                    </p>
                  </details>
                  <BalancedRate
                    minCaption={"🤢"}
                    maxCaption={"🤩"}
                    color={
                      ["I don't think so", "No"].includes(
                        shop.chocolatine_homemade,
                      )
                        ? "#9da3ae"
                        : "#f5be41"
                    }
                    value={from020to22(
                      shop.chocolatine_average_good_or_not_good,
                    )}
                  />
                </div>
                <div className="ml-1 mt-4 flex flex-col text-sm">
                  <details className="mb-1 inline-flex">
                    <summary>
                      Avis de gourmands ({detailedReviews?.length})
                    </summary>
                    <ul className="ml-8 mt-2 flex list-inside flex-col">
                      {detailedReviews?.map((r, index: number) => {
                        const review = r as unknown as ChocolatineReview;
                        return (
                          <li key={index} className="mb-2">
                            <strong>
                              {review.good_or_not_good}
                              /20
                            </strong>
                            <span> - {review?.user_username}</span>
                            <small className="opacity-50">
                              {" - "}
                              {new Intl.DateTimeFormat("en-GB", {
                                dateStyle: "short",
                                timeStyle: "short",
                              }).format(new Date(review.created_at))}
                            </small>
                            <p>{review.comment}</p>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </div>
              </>
            )}
            <div className="mb-2 mt-10 flex items-center justify-between">
              <h3 className="font-bold">Ingrédients</h3>
              <ClientOnly>
                {() => (
                  <a
                    href={newIngredient(shop.name)}
                    className="ml-auto text-xs"
                  >
                    🥣 Ajouter (par email)
                  </a>
                )}
              </ClientOnly>
            </div>
            Ingredients non renseignés
          </section>
          <section className="w-full shrink-0 gap-y-4 overflow-y-auto px-4 pb-6">
            <h3 className="mb-2 mt-10 font-bold">Informations du magasin</h3>
            {!!awards.length && (
              <dl className="px-4 font-semibold">
                {awards.map(({ award, position, year, id }) => {
                  return (
                    <p key={id} className="text-sm">
                      {readablePositions[position]} - {readableAwards[award]}{" "}
                      {year}
                    </p>
                  );
                })}
              </dl>
            )}
            {!!shop.description && (
              <dl className="px-4 text-sm opacity-70">{shop.description}</dl>
            )}
            <address className="mt-2 flex flex-col items-start justify-start gap-2 px-4 pb-11 text-sm font-light not-italic text-[#3c4043]">
              <span
                aria-details="address"
                className="flex"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}&travelmode=walking`,
                    "_blank",
                  );
                }}
              >
                <img src="/assets/pin-grey.svg" className="mr-3 w-5" />
                {!!shop.streetAddress ? (
                  <>
                    {shop.streetAddress}
                    <br />
                    {shop.addresspostalCode} {shop.addressLocality}{" "}
                    {shop.addressCountry}
                  </>
                ) : (
                  <>{shop.addressLocality}</>
                )}
              </span>
              <span aria-details="opening hours" className="flex text-sm">
                <img src="/assets/clock-grey.svg" className="mr-3 w-5" />
                {shop.openingHoursSpecification ? (
                  <Availability shop={shop} />
                ) : (
                  "Horaires non renseignés"
                )}
              </span>
              {shop.telephone && (
                <span aria-details="phone" className="flex">
                  <img src="/assets/phone-grey.svg" className="mr-3 w-5" />
                  {shop.telephone}
                </span>
              )}
              {shop.url && (
                <span aria-details="website" className="flex">
                  <img src="/assets/web-grey.svg" className="mr-3 w-5" />
                  <a href={shop.url} className="underline" target="_blank">
                    {shop.url}
                  </a>
                </span>
              )}
            </address>
            <ClientOnly>
              {() => (
                <button
                  type="button"
                  className="my-2 block text-xs underline"
                  onClick={() => {
                    // open share UI
                    if (navigator.share) {
                      navigator.share({
                        title: `${shop.name} - Kiss My Chocolatine`,
                        text: "Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
                        url: window.location.href,
                      });
                      return;
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard");
                    }
                  }}
                >
                  📤 Partagez le lien
                </button>
              )}
            </ClientOnly>
            <Link
              to={`/${params.product}/${shop.id}/award`}
              className="my-2 block text-xs underline"
            >
              🥇 Ajoutez une récompense
            </Link>
            <ClientOnly>
              {() => (
                <a
                  href={newFeedback(shop.name)}
                  className="my-2 ml-auto block text-xs"
                >
                  Un commentaire? Bon, mauvais, avis, information manquante ou
                  erronée... <u>Cliquez ici</u> pour nous envoyer un
                  email&nbsp;!
                </a>
              )}
            </ClientOnly>
          </section>
        </div>
      </div>
      <Outlet />
    </>
  );
}
