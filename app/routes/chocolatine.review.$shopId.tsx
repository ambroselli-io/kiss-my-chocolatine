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
import Cookies from "js-cookie";
import type { User } from "@prisma/client";
import { compileReviews } from "~/utils/review";
import useChocolatineName from "~/utils/useChocolatineName";

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

  const chocolatineParams = {
    homemade: String(homemade),
    price: Number(price),
  };

  const chocolatine = await prisma.chocolatine.upsert({
    where: {
      shop_id: shop.id,
    },
    create: {
      shop_id: shop.id,
      shop_name: shop.name,
      created_by_user_id: user.id,
      created_by_user_email: user.email,
      has_been_reviewed_once: true,
      ...chocolatineParams,
    },
    update: chocolatineParams,
  });

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
      user_id_chocolatine_id: `${user.id}_${chocolatine.id}`,
    },
    create: {
      user_id_chocolatine_id: `${user.id}_${chocolatine.id}`,
      chocolatine_id: chocolatine.id,
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
      chocolatine_id: chocolatine?.id,
    },
  });

  const quality = compileReviews(chocolatineReviews ?? []);

  await prisma.chocolatine.update({
    where: {
      id: chocolatine.id,
    },
    data: {
      average_buttery: quality.average_buttery,
      average_flaky_or_brioche: quality.average_flaky_or_brioche,
      average_golden_or_pale: quality.average_golden_or_pale,
      average_crispy_or_soft: quality.average_crispy_or_soft,
      average_light_or_dense: quality.average_light_or_dense,
      average_chocolate_disposition: quality.average_chocolate_disposition,
      average_big_or_small: quality.average_big_or_small,
      average_good_or_not_good: quality.average_good_or_not_good,
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

  return redirect(`/chocolatine/${shop.id}`);
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
  const chocolatine = await prisma.chocolatine?.findUnique({
    where: {
      shop_id: params.shopId,
    },
  });
  const myReview = chocolatine
    ? await prisma.chocolatineReview.findUnique({
        where: {
          user_id_chocolatine_id: `${userId}_${chocolatine.id}`,
        },
      })
    : null;
  return json({ shop, chocolatine, myReview });
};

export default function Add() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const { shop, chocolatine, myReview } = useLoaderData<typeof loader>();

  const { chocolatineName } = useChocolatineName();

  return (
    <ModalRouteContainer
      aria-label={`Add new review for ${shop.name}'s ${chocolatineName}`}
      title={`Add new review for ${shop.name}'s ${chocolatineName}`}
    >
      <ModalBody className="border-t border-t-gray-300">
        <Form id="add-review-form" method="post" className="m-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <select
              id="homemade"
              name="homemade"
              required
              className="block w-full rounded-md border-0 p-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-app-500 sm:text-sm sm:leading-6"
              defaultValue={chocolatine?.homemade}
            >
              <option>I don't know, nobody tried yet</option>
              <option>Yes</option>
              <option>I think so</option>
              <option>I don't think so</option>
              <option>No</option>
            </select>
            <label htmlFor="homemade">
              Homemade&nbsp;?<sup className="ml-1 text-red-500">*</sup>
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
              required
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="1.50"
              defaultValue={chocolatine?.price}
            />
            <label htmlFor="price">
              Price<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>

          <RadioRate
            name="buttery"
            minCaption={"Not at all"}
            maxCaption={"Anything but butter"}
            defaultValue={myReview?.buttery}
            legend="Buttery"
          >
            Some people like with A LOT, some other with just a touch. In any
            case, it's an important ingredient of the {chocolatineName}&nbsp;🧈
          </RadioRate>
          <RadioRate
            name="flaky_or_brioche"
            minCaption={"Flaky/Feuilleuté"}
            maxCaption={"Brioche"}
            defaultValue={myReview?.flaky_or_brioche}
            legend="Flaky/Feuilleuté or Brioche-like"
          >
            the original {chocolatineName} IS flaky. Butterly flaky. But it
            takes everything to make a world&nbsp;🤷
          </RadioRate>
          <RadioRate
            name="golden_or_pale"
            minCaption={"Golden"}
            maxCaption={"Pale"}
            defaultValue={myReview?.golden_or_pale}
            legend="Golden or Pale"
          >
            The more golden the more cooked.&nbsp;❤️‍🔥
          </RadioRate>
          <RadioRate
            name="crispy_or_soft"
            minCaption={"Crispy"}
            maxCaption={"Soft"}
            defaultValue={myReview?.crispy_or_soft}
            legend="Crispy or Soft"
          >
            A combinaison of buttery, flakiness and and time to cook&nbsp;🤯
          </RadioRate>
          <RadioRate
            name="light_or_dense"
            minCaption="Light"
            maxCaption="Dense"
            defaultValue={myReview?.light_or_dense}
            legend="Light or Dense"
          >
            This is a signature&nbsp;🧑‍🍳
          </RadioRate>
          <RadioRate
            name="chocolate_disposition"
            minCaption={"Superimposed"}
            maxCaption={"On each edges"}
            defaultValue={myReview?.chocolate_disposition}
            legend="Chocolate disposition"
          >
            superimposed or well distributed?&nbsp;🖖
          </RadioRate>
          <RadioRate
            name="big_or_small"
            minCaption={"Very small"}
            maxCaption={"Very big"}
            defaultValue={myReview?.big_or_small}
            legend="Small or big"
          >
            this is manly to point out the too small ones, tbh&nbsp;👎
          </RadioRate>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="good_or_not_good"
              type="number"
              id="good_or_not_good"
              min="0"
              step="0.5"
              required
              onWheel={(e) => e.currentTarget.blur()}
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="A score from 0 to 20"
              defaultValue={myReview?.good_or_not_good}
            />
            <label htmlFor="price">
              Good or not good?<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <textarea
              name="comment"
              rows={3}
              id="comment"
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="Loving it! ❤️"
              defaultValue={myReview?.comment}
            />
            <label htmlFor="price">Any comment?</label>
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
          Add review
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
                required
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
