import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import Tabs from "~/components/Tabs";
import { Link, useLoaderData } from "@remix-run/react";
import chocolatines from "~/data/chocolatines.json";
import shops from "~/data/shops.json";
import Availability from "~/components/Availability";

const pictures = [
  "https://images.unsplash.com/photo-1607151815172-254f6b0c9b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTE0MTR8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDIzNDQ3MzQ&ixlib=rb-1.2.1&q=80&w=1080",
  "https://images.unsplash.com/photo-1595397351604-cf490cc38bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTE0MTR8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDIzNDQ3NTI&ixlib=rb-1.2.1&q=80&w=1080",
  "https://images.unsplash.com/photo-1577595927087-dedbe84f0e4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTE0MTR8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDIzNDQ3NjU&ixlib=rb-1.2.1&q=80&w=1080",
  "https://images.unsplash.com/photo-1532635224-cf024e66d122?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyOTE0MTR8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NDIzNDQ3NzI&ixlib=rb-1.2.1&q=80&w=1080",
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const chocolatine = chocolatines.find((c) => c.belongsTo.identifier === params.shopSlug);
  const quality: any = {
    softness: 0,
    flakiness: 0,
    crispiness: 0,
    fondant: 0,
    chocolate_quality: 0,
    chocolate_disposition: 0,
    note: 0,
    visual_aspect: 0,
  };
  for (const review of chocolatine?.reviews ?? []) {
    for (const criteria of review.additionalProperty) {
      if (!quality.hasOwnProperty(criteria.name)) continue;
      quality[criteria.name] += criteria.value;
    }
  }
  const isHomemade = chocolatine?.additionalProperty.find(
    (prop) => prop.name === "Homemade" && prop.value === true
  );
  const shop = shops.find((s) => s.identifier === params.shopSlug);
  return {
    chocolatine,
    isHomemade,
    quality,
    shop,
  };
};

const Shop = () => {
  const { chocolatine, quality, shop, isHomemade } = useLoaderData<typeof loader>();

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      id="drawer"
      className="h-[75vh] relative shrink-0 sm:max-h-none max-w-sm w-full sm:h-full bg-white drop-shadow-lg flex flex-col overflow-y-hidden">
      {/* <img src={pictures[0]} className="w-full h-60 object-cover" loading="lazy" /> */}
      <h1 className="font-bold px-4 mt-4 text-xl">{shop?.name} </h1>
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
            // style={{ filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1))" }}
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </Link>
      {/* <Tabs
        menu={["Pain au Chocolat", "About the shop"]}
        className="mt-3 grow shrink overflow-y-hidden"
        activeTab={activeTab}
        setActiveTab={setActiveTab}> */}
      <div className="w-full h-full overflow-x-auto overflow-y-auto flex-col">
        {/* <div
          style={{ transform: `translateX(${-activeTab * 100}%)` }}
          className="transition-transform h-full flex min-h-fit w-full"> */}
        <section className="w-full shrink-0 px-4 pt-4 overflow-y-auto min-h-fit">
          <h3 className={`mt-1 ${!isHomemade ? "text-red-500 font-bold" : "font-semibold"}`}>
            {isHomemade ? "Home made 🧑‍🍳 " : "Industrial 🏭 "}
          </h3>
          <p className="mt-3 mb-0">
            Price: {chocolatine?.offers.price} {chocolatine?.offers.priceCurrency}
          </p>
          <h3 className="mt-10 mb-2 font-bold">Reviews</h3>
          {Object.keys(quality).map((criteria) => {
            return (
              <div className="flex flex-col mt-2 ml-1 text-sm" key={criteria}>
                <span className="">
                  {criteria === "note" && <>Note globale </>}
                  {criteria === "visual_aspect" && <>Aspect visuel </>}
                  {criteria === "softness" && <>Moelleux </>}
                  {criteria === "flakiness" && <>Feuilletage </>}
                  {criteria === "crispiness" && <>Croustillant </>}
                  {criteria === "fondant" && <>Fondant </>}
                  {criteria === "chocolate_quality" && <>Qualité du chocolat </>}
                  {criteria === "chocolate_disposition" && <>Disposition du chocolat </>}
                  &nbsp;
                  {quality[criteria] === 0 && "😖"}
                  {quality[criteria] === 1 && "😒"}
                  {quality[criteria] === 2 && "🤨"}
                  {quality[criteria] === 3 && "😕"}
                  {quality[criteria] === 4 && "😋"}
                  {quality[criteria] === 5 && "🤩"}
                </span>
                <progress
                  max="5"
                  value={quality[criteria]}
                  className="w-full rounded-full overflow-hidden h-2"></progress>
              </div>
            );
          })}
          <h3 className="mt-10 mb-2 font-bold">Ingredients</h3>
          {chocolatine?.additionalType
            .find((type) => type.name === "Ingredients")
            ?.value?.map((ingredient) => {
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
                    <span className="font-semibold">{ingredient.name}</span>: {ingredient.quantity}
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
        </section>
        {/* </div> */}
      </div>
      {/* </Tabs> */}
    </div>
  );
};

export default Shop;
