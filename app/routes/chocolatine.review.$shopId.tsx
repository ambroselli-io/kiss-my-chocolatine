import {
  ActionFunctionArgs,
  json,
  redirect,
  LoaderFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import React from "react";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import {
  ModalBody,
  ModalFooter,
  ModalRouteContainer,
} from "~/components/Modal";
import { prisma } from "~/db/prisma.server";
import { getUserFromCookie, getUserIdFromCookie } from "~/services/auth.server";
import type { User, Shop, ChocolatineReview } from "@prisma/client";
import { compileReviews } from "~/utils/review";
import useChocolatineName from "~/utils/useChocolatineName";
import { readableHomemade } from "~/utils/homemade";

type ActionReturnType = {
  ok: boolean;
  error?: string;
};

export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<ActionReturnType> => {
  // Here we can update our database with the new invoice
  if (!params.shopId) return { ok: false, error: "Missing shop_id" };
  const user = (await getUserFromCookie(request, {
    failureRedirect: "/chocolatine/register?redirect=/chocolatine/new-shop",
  })) as User;
  if (!user) return { ok: false, error: "user doesnt exist" };
  const form = await request.formData();
  const shop = await prisma.shop.findUnique({
    where: {
      id: params.shopId,
    },
  });
  if (!shop) return { ok: false, error: "shop doesnt exist" };
  const homemade = form.get("homemade");
  const price = form.get("price");

  const buttery = form.get("buttery");
  const flaky_or_brioche = form.get("flaky_or_brioche");
  const golden_or_pale = form.get("golden_or_pale");
  const crispy_or_soft = form.get("crispy_or_soft");
  const light_or_dense = form.get("light_or_dense");
  const chocolate_disposition = form.get("chocolate_disposition");
  const big_or_small = form.get("big_or_small");
  const good_or_not_good = form.get("good_or_not_good");
  const comment = form.get("comment");

  const hasBeenReviewedOnce =
    buttery !== null ||
    flaky_or_brioche !== null ||
    golden_or_pale !== null ||
    crispy_or_soft !== null ||
    light_or_dense !== null ||
    chocolate_disposition !== null ||
    big_or_small !== null ||
    !!good_or_not_good ||
    !!comment;

  const review = {
    buttery: Number(buttery),
    flaky_or_brioche: Number(flaky_or_brioche),
    golden_or_pale: Number(golden_or_pale),
    crispy_or_soft: Number(crispy_or_soft),
    light_or_dense: Number(light_or_dense),
    chocolate_disposition: Number(chocolate_disposition),
    big_or_small: Number(big_or_small),
    good_or_not_good: Number(good_or_not_good),
    comment: String(comment),
  };

  await prisma.chocolatineReview.upsert({
    where: {
      user_id_shop_id: `${user.id}_${shop.id}`,
    },
    create: {
      user_id_shop_id: `${user.id}_${shop.id}`,
      user_id: user.id,
      user_username: user.username,
      user_email: user.email,
      shop_id: shop.id,
      shop_name: shop.name,
      ...review,
    },
    update: review,
  });

  const chocolatineReviews = await prisma.chocolatineReview.findMany({
    where: {
      shop_id: shop.id,
    },
  });

  const quality = compileReviews(chocolatineReviews ?? []);

  await prisma.shop.update({
    where: {
      id: shop.id,
    },
    data: {
      chocolatine_average_buttery: quality.average_buttery,
      chocolatine_average_flaky_or_brioche: quality.average_flaky_or_brioche,
      chocolatine_average_golden_or_pale: quality.average_golden_or_pale,
      chocolatine_average_crispy_or_soft: quality.average_crispy_or_soft,
      chocolatine_average_light_or_dense: quality.average_light_or_dense,
      chocolatine_average_chocolate_disposition:
        quality.average_chocolate_disposition,
      chocolatine_average_big_or_small: quality.average_big_or_small,
      chocolatine_average_good_or_not_good: quality.average_good_or_not_good,
      chocolatine_homemade: String(homemade),
      chocolatine_price: Number(price),
      chocolatine_has_been_reviewed_once: hasBeenReviewedOnce,
    },
  });

  await prisma.userAction.create({
    data: {
      action: "USER_CHOCOLATINE_CRITERIAS_REVIEW",
      user_id: user.id,
      number_of_actions: 1,
      user_email: user.email,
    },
  });
  await prisma.userAction.create({
    data: {
      action: "USER_CHOCOLATINE_COMMENT_SCORE",
      user_id: user.id,
      number_of_actions: 1,
      user_email: user.email,
    },
  });

  return redirect(`/chocolatine/${shop.id}?revalidate=true`);
};

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const userId = await getUserIdFromCookie(request, {
    failureRedirect: "/chocolatine/register?redirect=/chocolatine/new-shop",
  });
  const shop = await prisma.shop.findUnique({
    where: {
      id: params.shopId,
    },
  });

  const myReview = shop
    ? await prisma.chocolatineReview.findUnique({
        where: {
          user_id_shop_id: `${userId}_${params.shopId}`,
        },
      })
    : null;

  return json({ shop, myReview });
};

export default function ChocolatineReview() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const data = useLoaderData<typeof loader>();
  const shop = data.shop as Shop;
  const myReview = data.myReview as ChocolatineReview;

  const { chocolatineName } = useChocolatineName();

  return (
    <ModalRouteContainer
      aria-label={`${chocolatineName
        .slice(0, 1)
        .toLocaleUpperCase()}${chocolatineName.slice(1)} de ${
        shop.name
      }: ajouter un nouvel avis`}
      title={`${chocolatineName
        .slice(0, 1)
        .toLocaleUpperCase()}${chocolatineName.slice(1)} de ${
        shop.name
      }: ajouter un nouvel avis`}
    >
      <ModalBody className="border-t border-t-gray-300">
        <Form id="add-review-form" method="post" className="m-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <select
              id="homemade"
              name="homemade"
              required
              className="block w-full rounded-md border-0 p-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-app-500 sm:text-sm sm:leading-6"
            >
              {Object.entries(readableHomemade).map(([value, label]) => {
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            <label htmlFor="homemade">
              Fait maison&nbsp;?<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              id="price"
              onWheel={(e) => e.currentTarget.blur()}
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="1.50"
              defaultValue={shop.chocolatine_price || undefined}
            />
            <label htmlFor="price">
              Prix<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>

          <RadioRate
            name="buttery"
            minCaption={"Pas du tout"}
            maxCaption={"QUE du beurre"}
            defaultValue={myReview?.buttery}
            legend="Y'a-t-il du beurre?"
          >
            Certains aiment avec BEAUCOUP, d'autres avec juste une touche. Dans
            tous les cas, c'est un ingrédient ESSENTIEL&nbsp;🧈
          </RadioRate>
          <RadioRate
            name="flaky_or_brioche"
            minCaption={"Feuilleuté"}
            maxCaption={"Brioché"}
            defaultValue={myReview?.flaky_or_brioche}
            legend="Est-ce plus feuilleté ou plus brioché?"
          >
            L'original est feuilleté. Beurré et feuilleté. Mais il faut de tout
            pour faire un monde&nbsp;🤷
          </RadioRate>
          <RadioRate
            name="golden_or_pale"
            minCaption={"Doré"}
            maxCaption={"Pâle"}
            defaultValue={myReview?.golden_or_pale}
            legend="Doré ou pâle?"
          >
            Le plus doré, le plus cuit.&nbsp;❤️‍🔥
          </RadioRate>
          <RadioRate
            name="crispy_or_soft"
            minCaption={"Croustillant"}
            maxCaption={"Mou"}
            defaultValue={myReview?.crispy_or_soft}
            legend="Croustillant ou mou?"
          >
            Une combinaison de beurre, de feuilletage et de temps de
            cuisson&nbsp;🤯
          </RadioRate>
          <RadioRate
            name="light_or_dense"
            minCaption="Aéré"
            maxCaption="Dense"
            defaultValue={myReview?.light_or_dense}
            legend="Aéré ou Dense?"
          >
            C'est une signature&nbsp;🧑‍🍳
          </RadioRate>
          <RadioRate
            name="chocolate_disposition"
            minCaption={"Superposé"}
            maxCaption={"Sur les bords"}
            defaultValue={myReview?.chocolate_disposition}
            legend="Comment est la disposition du chocolat?"
          >
            superposé ou bien distribué?&nbsp;🖖
          </RadioRate>
          <RadioRate
            name="big_or_small"
            minCaption={"Très petit"}
            maxCaption={"Très gros"}
            defaultValue={myReview?.big_or_small}
            legend="Petit ou gros?"
          >
            c'est surtout pour pointer les trop petits, honnêtement&nbsp;👎
          </RadioRate>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="good_or_not_good"
              type="number"
              id="good_or_not_good"
              min="0"
              max="20"
              step="0.5"
              onWheel={(e) => e.currentTarget.blur()}
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="Une note de 0 à 20"
              defaultValue={myReview?.good_or_not_good || undefined}
            />
            <label htmlFor="price">
              En fin de compte, est-il bon?
              <sup className="ml-1 text-red-500">*</sup>
              <small className="ml-4 opacity-70">Une note de 0 à 20</small>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <textarea
              name="comment"
              rows={3}
              id="comment"
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="Loving it! ❤️"
              defaultValue={myReview?.comment ?? ""}
            />
            <label htmlFor="price">Un commentaire?</label>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button
          type="submit"
          form="add-review-form"
          className="rounded-lg bg-[#FFBB01] px-4 py-2 disabled:opacity-25"
          disabled={busy}
        >
          Ajouter mon avis
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}

function RadioRate({
  name,
  defaultValue,
  minCaption,
  maxCaption,
  legend,
  children,
}: {
  name: string;
  defaultValue: number;
  minCaption: string;
  maxCaption: string;
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
      <div className="flex w-full flex-row justify-evenly">
        {[-2, -1, 0, 1, 2].map((value) => {
          return (
            <div
              key={value}
              className="flex shrink-0 grow basis-0 flex-col items-center justify-center"
            >
              <input
                name={name}
                type="radio"
                id={name}
                value={value}
                className="block h-4 w-4 grow-0 border-0 bg-transparent p-2.5 text-app-500 outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
                defaultChecked={defaultValue === value}
              />
              <span className="inline-flex shrink-0 grow basis-0 items-start justify-end text-right text-xs text-gray-500">
                {value === -2 && minCaption}
                {value === 0 && "⚖️"}
                {value === 2 && maxCaption}
              </span>
            </div>
          );
        })}
      </div>
      <details className="question">
        <summary>
          <label htmlFor={name}>
            {legend}
            <sup className="ml-1 text-red-500">*</sup>
          </label>
        </summary>
        <p className="pl-4 text-sm opacity-40">{children}</p>
      </details>
    </div>
  );
}
