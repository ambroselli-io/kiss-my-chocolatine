import type {
  LoaderFunctionArgs,
  MetaArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import chocolatines from "~/data/chocolatines.json";
import shops from "~/data/shops.json";
import Availability from "~/components/Availability";
import { newFeedback, newIngredient, newReview } from "~/utils/emails";

export const meta: MetaFunction = ({ params, data }: MetaArgs) => {
  data = data as never;
  return [
    { title: "Kiss my Chocolatine" },
    {
      name: "description",
      content:
        "All about the Pains Au Chocolat in the world 🌍 The shops, the ingredients, the reviews",
    },
    { "script:ld+json": data.chocolatine, key: "chocolatine" },
    { "script:ld+json": data.shop, key: "shop" },
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
  const email = useOutletContext();

  return (
    <div
      id="drawer"
      className="relative z-20 flex h-[75vh] w-full max-w-sm shrink-0 flex-col overflow-y-hidden bg-white drop-shadow-lg sm:z-0 sm:h-full sm:max-h-full"
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
            <a href={newReview(email, shop?.name)} className="ml-auto text-xs">
              🙋 Add mine
            </a>
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
                      {criteria === "note" && <>Global note </>}
                      {criteria === "visual_aspect" && <>Visual aspect </>}
                      {criteria === "softness" && <>Softness/Moelleux </>}
                      {criteria === "flakiness" && <>Flakiness/Feuilletage </>}
                      {criteria === "crispiness" && (
                        <>Crispiness/Croustillant </>
                      )}
                      {criteria === "fondant" && <>Fondant </>}
                      {criteria === "chocolate_quality" && (
                        <>Chocolate Quality </>
                      )}
                      {criteria === "chocolate_disposition" && (
                        <>Chocolate Disposition </>
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
            <a
              href={newIngredient(email, shop?.name)}
              className="ml-auto text-xs"
            >
              🔄 Update
            </a>
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
          <a href={newFeedback(email, shop?.name)} className="ml-auto text-xs">
            Any feedback? Good, bad, review, wrong or missing information...
            Please <u>click here</u> to shoot us an email!
          </a>
        </section>
      </div>
    </div>
  );
};

export default Shop;
