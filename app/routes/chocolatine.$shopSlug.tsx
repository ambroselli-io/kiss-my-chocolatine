import type {
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import chocolatines from "~/data/chocolatines.json";
import shops from "~/data/shops.json";
import Availability from "~/components/Availability";
import { newFeedback, newIngredient, newReview } from "~/utils/emails";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export const meta: MetaFunction = ({ matches, data }: MetaArgs) => {
  data = data as never;
  const parentMeta = matches[matches.length - 2].meta ?? [];
  return [
    ...parentMeta,
    { "script:ld+json": data.chocolatine, key: "chocolatine" },
  ];
};
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const chocolatine = chocolatines.find(
    (c) => c.belongsTo.identifier === params.shopSlug,
  );
  const quality: any = {
    note: null,
    visual_aspect: null,
    softness: null,
    flakiness: null,
    crispiness: null,
    fondant: null,
    chocolate_quality: null,
    chocolate_disposition: null,
  };
  for (const review of chocolatine?.reviews ?? []) {
    for (const criteria of review.additionalProperty) {
      if (!quality.hasOwnProperty(criteria.name)) continue;
      quality[criteria.name] += criteria.value;
    }
  }
  const isHomemade = String(
    chocolatine?.additionalProperty.find((prop) => prop.name === "Homemade")
      ?.value,
  );
  const shop = shops.find((s) => s.identifier === params.shopSlug);
  return {
    chocolatine,
    isHomemade,
    quality: chocolatine?.reviews.length ? quality : null,
    ingredients: chocolatine?.additionalType.find(
      (type) => type.name === "Ingredients",
    )?.value,
    shop,
  };
};

const Shop = () => {
  const { chocolatine, quality, shop, isHomemade, ingredients } =
    useLoaderData<typeof loader>();
  const [chocolatineName, setChocolatineName] = useState("pain au chocolat");
  useEffect(() => {
    setChocolatineName(Cookies.get("chocolatine-name") || "pain au chocolat");
  }, []);
  return (
    <div
      id="drawer"
      className="relative z-20 flex h-[75vh] w-full max-w-screen-sm shrink-0 flex-col overflow-y-hidden bg-white drop-shadow-lg sm:z-0 sm:h-full sm:max-h-full sm:max-w-sm"
    >
      <h2 className="mt-4 px-4 text-xl font-bold">{shop?.name} </h2>
      <span
        aria-details="address"
        className="mt-1 flex cursor-pointer pl-6 text-sm opacity-70"
        onClick={() => {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${shop?.geo.latitude},${shop?.geo.longitude}&travelmode=walking`,
            "_blank",
          );
        }}
      >
        <img src="/assets/pin-grey.svg" className="mr-1 w-5 sm:mr-3" />
        {shop?.address.streetAddress}
        <br />
        {shop?.address.postalCode} {shop?.address.addressLocality}{" "}
        {shop?.address.addressCountry}
      </span>
      <span
        aria-details="opening hours"
        className="mt-1 flex pl-6 text-sm opacity-70"
      >
        <img src="/assets/clock-grey.svg" className="mr-1 w-5 sm:mr-3" />
        <Availability shop={shop} />
      </span>
      <Link className="absolute right-2 top-2 font-light text-black" to="..">
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
          <div className="mb-2 mt-10 flex justify-between">
            <h3 className="font-bold">Reviews</h3>
            <ClientOnly>
              {() => (
                <a href={newReview(shop?.name)} className="ml-auto text-xs">
                  🙋 Add mine
                </a>
              )}
            </ClientOnly>
          </div>
          {!quality
            ? "No review yet"
            : Object.keys(quality).map((criteria) => {
                return (
                  <div
                    className="ml-1 mt-2 flex flex-col text-sm"
                    key={criteria}
                  >
                    <span className="">
                      {criteria === "note" && (
                        <details className="inline-flex">
                          <summary>Global note</summary>
                          <p className="text-xs italic opacity-70">
                            independantly from the rest of the criterias, this
                            is your global feeling about the {chocolatineName}
                            &nbsp; 🤗
                          </p>
                        </details>
                      )}
                      {criteria === "visual_aspect" && (
                        <details className="inline-flex">
                          <summary>Visual aspect</summary>
                          <p className="text-xs italic opacity-70">
                            there is quite a pattern, even though some bakers
                            are creative. Your subjectivity is welcome
                            here&nbsp;🤓
                          </p>
                        </details>
                      )}
                      {criteria === "softness" && (
                        <details className="inline-flex">
                          <summary>Softness/Moelleux</summary>
                          <p className="text-xs italic opacity-70">
                            not too soft, not too hard&nbsp;😇
                          </p>
                        </details>
                      )}
                      {criteria === "flakiness" && (
                        <details className="inline-flex">
                          <summary>Flakiness/Feuilletage</summary>
                          <p className="text-xs italic opacity-70">
                            the original {chocolatineName} IS flaky. Butterly
                            flaky. Non butterly flaky {chocolatineName} is a bad{" "}
                            {chocolatineName}&nbsp;😖
                          </p>
                        </details>
                      )}
                      {criteria === "crispiness" && (
                        <details className="inline-flex">
                          <summary>Crispiness/Croustillant</summary>
                          <p className="text-xs italic opacity-70">
                            not too crispy, but just a soupçon of what makes it
                            great&nbsp;🤤
                          </p>
                        </details>
                      )}
                      {criteria === "fondant" && (
                        <details className="inline-flex">
                          <summary>Fondant</summary>
                          <p className="text-xs italic opacity-70">
                            butter, chocolate, flakiness and softness all
                            together in your mouth&nbsp;🤩
                          </p>
                        </details>
                      )}
                      {criteria === "chocolate_quality" && (
                        <details className="inline-flex">
                          <summary>Chocolate Quality</summary>
                          <p className="text-xs italic opacity-70">🍫</p>
                        </details>
                      )}
                      {criteria === "chocolate_disposition" && (
                        <details className="inline-flex">
                          <summary>Chocolate Disposition</summary>
                          <p className="text-xs italic opacity-70">
                            a {chocolatineName} has two chocolate bars, one on
                            each side. A {chocolatineName} with only one
                            chocolate bar, or with thw two bars stuck together
                            is a sad {chocolatineName}&nbsp;😤
                          </p>
                        </details>
                      )}
                      : &nbsp;
                      <span className="font-extralight">
                        {quality[criteria]}
                      </span>
                      &nbsp;
                      {quality[criteria] < 1
                        ? "😖"
                        : quality[criteria] < 2
                        ? "😒"
                        : quality[criteria] < 3
                        ? "🤨"
                        : quality[criteria] < 4
                        ? "😕"
                        : quality[criteria] < 4.6
                        ? "😋"
                        : "🤩"}
                    </span>
                    <progress
                      max="5"
                      value={quality[criteria]}
                      className="h-2 w-full max-w-[15rem] overflow-hidden rounded-full"
                    />
                  </div>
                );
              })}
          <div className="mb-2 mt-10 flex justify-between">
            <h3 className="font-bold">Ingredients</h3>
            <ClientOnly>
              {() => (
                <a href={newIngredient(shop?.name)} className="ml-auto text-xs">
                  🔄 Update
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
                      src={`/assets/${ingredient.additionalProperties.find(
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
              {shop?.address.streetAddress}
              <br />
              {shop?.address.postalCode} {shop?.address.addressLocality}{" "}
              {shop?.address.addressCountry}
            </span>
            <span aria-details="opening hours" className="flex text-sm">
              <img src="/assets/clock-grey.svg" className="mr-3 w-5" />
              <Availability shop={shop} />
            </span>
            {shop?.telephone && (
              <span aria-details="phone" className="flex">
                <img src="/assets/phone-grey.svg" className="mr-3 w-5" />
                {shop?.telephone}
              </span>
            )}
            {shop?.url && (
              <span aria-details="website" className="flex">
                <img src="/assets/web-grey.svg" className="mr-3 w-5" />
                <a href={shop?.url} className="underline" target="_blank">
                  {shop?.url}
                </a>
              </span>
            )}
          </address>
          <ClientOnly>
            {() => (
              <a href={newFeedback(shop?.name)} className="ml-auto text-xs">
                Any feedback? Good, bad, review, wrong or missing information...
                Please <u>click here</u> to shoot us an email!
              </a>
            )}
          </ClientOnly>
        </section>
      </div>
    </div>
  );
};

export default Shop;
