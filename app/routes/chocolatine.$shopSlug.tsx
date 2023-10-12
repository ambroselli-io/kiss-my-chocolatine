import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import chocolatines from "~/data/chocolatines.json";
import shops from "~/data/shops.json";
import Availability from "~/components/Availability";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const chocolatine = chocolatines.find((c) => c.belongsTo.identifier === params.shopSlug);
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
    chocolatine?.additionalProperty.find((prop) => prop.name === "Homemade")?.value
  );
  const shop = shops.find((s) => s.identifier === params.shopSlug);
  return {
    chocolatine,
    isHomemade,
    quality: chocolatine?.reviews.length ? quality : null,
    ingredients: chocolatine?.additionalType.find((type) => type.name === "Ingredients")?.value,
    shop,
  };
};

const Shop = () => {
  const { chocolatine, quality, shop, isHomemade, ingredients } = useLoaderData<typeof loader>();

  const email =
    typeof window !== "undefined" ? window.atob("a2lzcy5teS5jaG9jb2xhdGluZUBnbWFpbC5jb20=") : "";

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      id="drawer"
      className="h-[75vh] relative shrink-0 sm:max-h-full max-w-sm w-full sm:h-full bg-white drop-shadow-lg flex flex-col overflow-y-hidden z-20 sm:z-0">
      <h2 className="font-bold px-4 mt-4 text-xl">{shop?.name} </h2>
      <span
        aria-details="address"
        className="pl-6 opacity-70 flex text-sm mt-1 cursor-pointer"
        onClick={() => {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${shop?.geo.latitude},${shop?.geo.longitude}&travelmode=walking`,
            "_blank"
          );
        }}>
        <img src="/assets/pin-grey.svg" className="w-5 mr-1 sm:mr-3" />
        {shop?.address.streetAddress}
        <br />
        {shop?.address.postalCode} {shop?.address.addressLocality} {shop?.address.addressCountry}
      </span>
      <span aria-details="opening hours" className="pl-6 opacity-70 flex text-sm mt-1">
        <img src="/assets/clock-grey.svg" className="w-5 mr-1 sm:mr-3" />
        <Availability shop={shop} />
      </span>
      <Link className="font-light text-black absolute right-2 top-2" to="..">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            className="drop-shadow-sm"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </Link>
      <div className="w-full h-full overflow-x-auto overflow-y-auto flex-col">
        <section className="w-full shrink-0 px-4 pt-4 overflow-y-auto min-h-fit">
          <h3 className={`mt-1 ${!isHomemade ? "text-red-500 font-bold" : "font-semibold"}`}>
            {isHomemade === "true" && "Home made 🧑‍🍳 "}
            {isHomemade === "false" && "Industrial 🏭 "}
          </h3>
          <p className="mt-3 mb-0">
            Price:{" "}
            {chocolatine?.offers?.price
              ? `${chocolatine?.offers.price} ${chocolatine?.offers.priceCurrency}`
              : "N/A"}
          </p>
          <div className="mt-10 mb-2 flex justify-between">
            <h3 className="font-bold">Reviews</h3>
            <a
              href={`mailto:${email}?subject=New Review for ${shop?.name}'s Pain au Chocolat&body=You can fill any of these fields, with a note from 0 to 5%0A-Softness/Moelleux:%0A-Flakiness/Feuilletage:%0A-Crispiness/Croustillant:%0A-Fondant:%0A-Chocolate quality:%0A-Chocolate disposition:%0A-Note:%0A-Visual aspect:%0A%0AIf you know the ingredients, you can add them here too%0A%0AIf we are missing any information about the bakery, please tell us here too%0A%0AThanks!%0A%0AArnaud, from Kiss My Chocolatine`}
              className="ml-auto text-xs">
              🙋 Add mine
            </a>
          </div>
          {!quality
            ? "No review yet"
            : Object.keys(quality).map((criteria) => {
                return (
                  <div className="flex flex-col mt-2 ml-1 text-sm" key={criteria}>
                    <span className="">
                      {criteria === "note" && <>Global note </>}
                      {criteria === "visual_aspect" && <>Visual aspect </>}
                      {criteria === "softness" && <>Softness/Moelleux </>}
                      {criteria === "flakiness" && <>Flakiness/Feuilletage </>}
                      {criteria === "crispiness" && <>Crispiness/Croustillant </>}
                      {criteria === "fondant" && <>Fondant </>}
                      {criteria === "chocolate_quality" && <>Chocolate Quality </>}
                      {criteria === "chocolate_disposition" && <>Chocolate Disposition </>}
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
                      className="w-full rounded-full overflow-hidden h-2"></progress>
                  </div>
                );
              })}
          <div className="mt-10 mb-2 flex justify-between">
            <h3 className="font-bold">Ingredients</h3>
            <a
              href={`mailto:${email}?subject=Ingredient's list for ${shop?.name}'s Pain au Chocolat&body=For each ingredient, please fill up (if you know/want)%0A-name:%0A-quantity, with the unit (like 200g or 3 pincées):%0A-supplier:%0A-origin (country/city):%0A%0APlease, don't lie, tell the truth. We'll double check anyway, at some point.%0A%0AIngredients:%0A%0A%0A%0A%0AThanks!%0A%0AArnaud, from Kiss My Chocolatine`}
              className="ml-auto text-xs">
              🔄 Update
            </a>
          </div>
          {!ingredients?.length
            ? "Ingredients not listed yet"
            : ingredients.map((ingredient) => {
                return (
                  <div className="mt-2 ml-1 text-sm flex" key={ingredient.name}>
                    <img
                      className="h-6 w-6 mr-2"
                      src={`/assets/${
                        ingredient.additionalProperties.find((prop) => prop.name === "Icon")?.value
                      }`}
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
        <section className="w-full shrink-0  px-4 overflow-y-auto pb-6">
          <h3 className="mt-10 mb-2 font-bold">Shop infos</h3>
          <address className="flex flex-col px-4 mt-5 pb-11 text-[#3c4043] text-sm not-italic font-light items-start gap-2 justify-start">
            <span aria-details="address" className="flex">
              <img src="/assets/pin-grey.svg" className="w-5 mr-3" />
              {shop?.address.streetAddress}
              <br />
              {shop?.address.postalCode} {shop?.address.addressLocality}{" "}
              {shop?.address.addressCountry}
            </span>
            <span aria-details="opening hours" className="flex text-sm">
              <img src="/assets/clock-grey.svg" className="w-5 mr-3" />
              <Availability shop={shop} />
            </span>
            {shop?.telephone && (
              <span aria-details="phone" className="flex">
                <img src="/assets/phone-grey.svg" className="w-5 mr-3" />
                {shop?.telephone}
              </span>
            )}
            {shop?.url && (
              <span aria-details="website" className="flex">
                <img src="/assets/web-grey.svg" className="w-5 mr-3" />
                <a href={shop?.url} className="underline" target="_blank">
                  {shop?.url}
                </a>
              </span>
            )}
          </address>
          <a
            href={`mailto:${email}?subject=Feedback for ${shop?.name}'s Pain au Chocolat&body=Please, tell us:%0A%0AIngredients:%0A%0A%0A%0A%0AThanks!%0A%0AArnaud, from Kiss My Chocolatine`}
            className="ml-auto text-xs">
            Any feedback? Good, bad, review, wrong or missing information... Please <u>click here</u> to
            shoot us an email!
          </a>
        </section>
      </div>
    </div>
  );
};

export default Shop;
