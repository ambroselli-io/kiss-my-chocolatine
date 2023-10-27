import type {
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import chocolatines from "~/data/chocolatines.json";
import shops from "~/data/shops.json";
import Availability from "~/components/Availability";
import BalancedRate from "~/components/BalancedRate";
import { newFeedback, newIngredient, newReview } from "~/utils/emails";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { compileReviews } from "~/utils/review";
import type { Shop } from "~/types/shop";
import type { Chocolatine } from "~/types/chocolatine";

export const meta: MetaFunction = ({ matches, data }: MetaArgs) => {
  const parentMeta = matches[matches.length - 2].meta ?? [];
  return [
    ...parentMeta,
    { "script:ld+json": data?.chocolatine, key: "chocolatine" },
  ];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const chocolatine = chocolatines.find(
    (c) => c.belongsTo.identifier === params.shopSlug,
  ) as Chocolatine;
  const quality = compileReviews(chocolatine?.reviews ?? []);
  const isHomemade = String(
    chocolatine?.additionalProperty.find((prop) => prop.name === "Homemade")
      ?.value,
  );
  const shop = shops.find((s) => s.identifier === params.shopSlug) as Shop;
  return {
    chocolatine,
    isHomemade,
    quality: chocolatine?.reviews.length ? quality : null,
    ingredients: chocolatine?.additionalType.find(
      (type) => type.name === "Ingredients",
    )?.value,
    shop,
    detailedReviews: chocolatine?.reviews.filter((r) => r.reviewBody),
  };
};

export default function Shop() {
  const {
    chocolatine,
    detailedReviews,
    quality,
    shop,
    isHomemade,
    ingredients,
  } = useLoaderData<typeof loader>();
  const [chocolatineName, setChocolatineName] = useState("pain au chocolat");
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setChocolatineName(Cookies.get("chocolatine-name") || "pain au chocolat");
  }, []);

  return (
    <div
      id="drawer"
      className="relative z-20 flex h-[75vh] w-full max-w-screen-sm shrink-0 flex-col overflow-y-hidden bg-white drop-shadow-lg sm:z-0 sm:h-auto sm:max-h-full sm:max-w-sm sm:flex-1 sm:basis-full"
    >
      <h2 className="mt-4 px-4 text-xl font-bold">{shop.name} </h2>
      <span
        aria-details="address"
        className="mt-1 flex cursor-pointer pl-6 text-sm opacity-70"
        onClick={() => {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${shop.geo.latitude},${shop.geo.longitude}&travelmode=walking`,
            "_blank",
          );
        }}
      >
        <img src="/assets/pin-grey.svg" className="mr-1 w-5 sm:mr-3" />
        {shop.address.streetAddress}
        <br />
        {shop.address.postalCode} {shop.address.addressLocality}{" "}
        {shop.address.addressCountry}
      </span>
      <span
        aria-details="opening hours"
        className="mt-1 flex pl-6 text-sm opacity-70"
      >
        <img src="/assets/clock-grey.svg" className="mr-1 w-5 sm:mr-3" />
        <Availability shop={shop} />
      </span>
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
              !isHomemade ? "font-bold text-red-500" : "font-semibold"
            }`}
          >
            {isHomemade === "true" && "Home made 🧑‍🍳 "}
            {isHomemade === "false" && "Industrial 🏭 "}
          </h3>
          <p className="mb-0 mt-3">
            Price:{" "}
            {chocolatine?.offers?.price
              ? `${chocolatine?.offers.price} ${chocolatine?.offers.priceCurrency}`
              : "N/A"}
          </p>
          <div className="mb-2 mt-10 flex items-center justify-between">
            <h3 className="font-bold">How is it like?</h3>
            <ClientOnly>
              {() => (
                <a href={newReview(shop.name)} className="ml-auto text-xs">
                  🙋 Add my review
                </a>
              )}
            </ClientOnly>
          </div>
          {!quality ? (
            "No review yet"
          ) : (
            <>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Butter:</summary>
                  <p className="text-xs italic opacity-70">
                    Some people like with A LOT, some other with just a touch.
                    In any case, it's an important ingredient of the{" "}
                    {chocolatineName}&nbsp;🧈
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Not at all"}
                  maxCaption={"Anything but butter"}
                  value={quality.buttery}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Flaky/Feuilleuté or Brioche-like</summary>
                  <p className="text-xs italic opacity-70">
                    the original {chocolatineName} IS flaky. Butterly flaky. But
                    it takes everything to make a world&nbsp;🤷
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Flaky/Feuilleuté"}
                  maxCaption={"Brioche"}
                  value={quality.flaky_or_brioche}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Golden or Pale</summary>
                  <p className="text-xs italic opacity-70">
                    The more golden the more cooked.&nbsp;❤️‍🔥
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Golden"}
                  maxCaption={"Pale"}
                  value={quality.golden_or_pale}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Crispy or Soft</summary>
                  <p className="text-xs italic opacity-70">
                    A combinaison of buttery, flakiness and and time to
                    cook&nbsp;🤯
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Crispy"}
                  maxCaption={"Soft"}
                  value={quality.crispy_or_soft}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Light or Dense</summary>
                  <p className="text-xs italic opacity-70">
                    This is a signature&nbsp;🧑‍🍳
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Light"}
                  maxCaption={"Dense"}
                  value={quality.light_or_dense}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Chocolate disposition</summary>
                  <p className="text-xs italic opacity-70">
                    superimposed or well distributed?&nbsp;🖖
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Superimposed"}
                  maxCaption={"On each edges"}
                  value={quality.chocolate_disposition}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Big or small</summary>
                  <p className="text-xs italic opacity-70">
                    this is maly to point out the too small ones, tbh&nbsp;👎
                  </p>
                </details>
                <BalancedRate
                  minCaption={"Very small"}
                  maxCaption={"Very big"}
                  value={quality.big_or_small}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>Good or not good?</summary>
                  <p className="text-xs italic opacity-70">
                    the only subjective rating here - the other ones are
                    science&nbsp;🥸
                  </p>
                </details>
                <BalancedRate
                  minCaption={"🤢"}
                  maxCaption={"🤩"}
                  value={quality.good_or_not_good}
                />
              </div>
              <div className="ml-1 mt-4 flex flex-col text-sm">
                <details className="mb-1 inline-flex">
                  <summary>
                    Eater's reviews ({detailedReviews?.length})
                  </summary>
                  <ul className="ml-8 mt-2 flex list-inside flex-col">
                    {detailedReviews?.map((review, index) => (
                      <li key={index} className="mb-2">
                        <strong className="ml-2">{review?.author.name}</strong>
                        <small className="opacity-50">
                          {" - "}
                          {review?.datePublished}
                        </small>
                        <p>{review?.reviewBody}</p>
                        {/* You can also add other parts of the review here, like rating, etc. */}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </>
          )}
          <div className="mb-2 mt-10 flex items-center justify-between">
            <h3 className="font-bold">Ingredients</h3>
            <ClientOnly>
              {() => (
                <a href={newIngredient(shop.name)} className="ml-auto text-xs">
                  🥣 Update
                </a>
              )}
            </ClientOnly>
          </div>
          {!ingredients?.length
            ? "Ingredients not listed yet"
            : ingredients.map((ingredient) => {
                return (
                  <div
                    className="ml-1 mt-2 flex text-sm"
                    key={ingredient?.name}
                  >
                    <img
                      className="mr-2 h-6 w-6"
                      src={`/assets/${ingredient?.additionalProperties.find(
                        (prop) => prop.name === "Icon",
                      )?.value}`}
                      loading="lazy"
                    />
                    <span>
                      <span className="font-semibold">{ingredient.name}</span>:{" "}
                      {ingredient.quantity}
                    </span>
                  </div>
                );
              })}
        </section>
        <section className="w-full shrink-0  overflow-y-auto px-4 pb-6">
          <h3 className="mb-2 mt-10 font-bold">Shop infos</h3>
          <address className="mt-5 flex flex-col items-start justify-start gap-2 px-4 pb-11 text-sm font-light not-italic text-[#3c4043]">
            <span aria-details="address" className="flex">
              <img src="/assets/pin-grey.svg" className="mr-3 w-5" />
              {shop.address.streetAddress}
              <br />
              {shop.address.postalCode} {shop.address.addressLocality}{" "}
              {shop.address.addressCountry}
            </span>
            <span aria-details="opening hours" className="flex text-sm">
              <img src="/assets/clock-grey.svg" className="mr-3 w-5" />
              <Availability shop={shop} />
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
              <a href={newFeedback(shop.name)} className="ml-auto text-xs">
                Any feedback? Good, bad, review, wrong or missing information...
                Please <u>click here</u> to shoot us an email!
              </a>
            )}
          </ClientOnly>
        </section>
      </div>
    </div>
  );
}
