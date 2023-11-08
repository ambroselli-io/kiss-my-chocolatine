import {
  redirect,
  type LoaderFunctionArgs,
  type MetaArgs,
  type MetaFunction,
} from "@remix-run/node";
import type {
  Shop,
  ChocolatineReview,
  Chocolatine,
  Award,
} from "@prisma/client";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
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

export const meta: MetaFunction = ({ matches, data }: MetaArgs) => {
  const chocolatineSchemaOrg = (data as Record<string, SchemaOrgChocolatine>)
    .chocolatineSchemaOrg as SchemaOrgChocolatine;
  const shop = (data as Record<string, Shop>).shop as Shop;
  return [
    ...(matches[matches.length - 2].meta ?? []).filter((meta) => {
      if (meta.hasOwnProperty("title")) return false;
      if (meta.property === "og:title") return false;
      if (meta.property === "twitter:title") return false;
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
      chocolatine: {
        include: {
          chocolatineReviews: true,
        },
      },
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

  const { chocolatine: chocolatinePopulated, awards, ...shop } = shopPopulated;

  const { chocolatineReviews, ...chocolatine } = chocolatinePopulated ?? {};

  const detailedReviews =
    chocolatineReviews?.filter((r: ChocolatineReview) => !!r.comment) ?? [];

  return {
    chocolatine: chocolatine as Chocolatine,
    chocolatineSchemaOrg: chocolatineFromRowToSchemaOrg(
      chocolatine as Chocolatine,
      chocolatineReviews as Array<ChocolatineReview>,
    ),
    shop: shop as Shop,
    awards: awards as Array<Award>,
    ingredients: [], // TODO
    detailedReviews,
  };
};

export default function ChocolatineAndShop() {
  const data = useLoaderData<typeof loader>();
  const { chocolatine, detailedReviews, awards } = data;
  const shop = data.shop as unknown as Shop;
  const fromCookies = useChocolatineName();
  const [chocolatineName, setChocolatineName] = useState("pain au chocolat");
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setChocolatineName(fromCookies.chocolatineName);
  }, []);

  return (
    <div
      id="drawer"
      className="relative z-20 flex h-[75vh] w-full max-w-screen-sm shrink-0 flex-col overflow-y-hidden bg-white drop-shadow-lg sm:z-0 sm:h-auto sm:max-h-full sm:max-w-sm sm:flex-1 sm:basis-full"
    >
      <h2 className="mt-4 px-4 text-xl font-bold">{shop.name}</h2>

      <Link
        className="absolute right-2 top-2 font-light text-black"
        to={`/chocolatine?${searchParams.toString()}`}
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
      <div className="h-full w-full flex-col overflow-x-auto overflow-y-auto">
        <section className="min-h-fit w-full shrink-0 overflow-y-auto px-4 pt-4">
          <h3
            className={`mt-1 ${
              ["I don't think so", "No"].includes(chocolatine.homemade)
                ? "font-bold text-red-500"
                : "font-semibold"
            }`}
          >
            Fait maison&nbsp;: {readableHomemade[chocolatine.homemade]}
            {["I think so", "Yes"].includes(chocolatine.homemade) && " 🧑‍🍳 "}
            {["I don't think so", "No"].includes(chocolatine.homemade) &&
              " 🏭 "}
          </h3>
          <p className="mb-0 mt-3">
            Prix&nbsp;:{" "}
            {chocolatine.price
              ? `${chocolatine.price} ${chocolatine.priceCurrency}`
              : "N/A"}
          </p>
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
            <span aria-details="address" className="flex">
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
            to={`/chocolatine/award/${shop.id}`}
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
                erronée... <u>Cliquez ici</u> pour nous envoyer un email&nbsp;!
              </a>
            )}
          </ClientOnly>
        </section>
      </div>
    </div>
  );
}
