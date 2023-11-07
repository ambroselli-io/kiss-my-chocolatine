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
import type { User, AvailableAward, Positions } from "@prisma/client";
import { awards, positions } from "~/utils/awards";
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
  const award = form.get("award") as AvailableAward;
  const shop = await prisma.shop.findUnique({
    where: {
      id: params.shopId,
    },
  });

  if (!shop) return { ok: false, error: "shop doesnt exist" };

  let chocolatine = undefined;

  if (award === "MASTER_PAIN_AU_CHOCOLAT") {
    chocolatine = await prisma.chocolatine.findUnique({
      where: {
        shop_id: shop.id,
      },
    });
  }

  await prisma.award.create({
    data: {
      award,
      position: form.get("position") as Positions,
      year: Number(form.get("year")),
      shop_id: shop.id,
      shop_name: shop.name,
      chocolatine_id: chocolatine?.id,
    },
  });

  await prisma.userAction.create({
    data: {
      action: "USER_SHOP_UPDATE",
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
  return json({ shop, chocolatine });
};

export default function Add() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const { shop, chocolatine, myReview } = useLoaderData<typeof loader>();

  const { chocolatineName } = useChocolatineName();

  return (
    <ModalRouteContainer
      aria-label={`Add new award for ${shop.name}`}
      title={`Add new award for ${shop.name}`}
    >
      <ModalBody className="border-t border-t-gray-300">
        <Form id="add-review-form" method="post" className="m-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <select
              id="award"
              name="award"
              required
              className="block w-full rounded-md border-0 p-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-app-500 sm:text-sm sm:leading-6"
            >
              {Object.entries(awards).map(([key, name]) => {
                return (
                  <option key={key} value={key}>
                    {name}
                  </option>
                );
              })}
            </select>
            <label htmlFor="homemade">
              Award<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <select
              id="position"
              name="position"
              required
              className="block w-full rounded-md border-0 p-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-app-500 sm:text-sm sm:leading-6"
            >
              {Object.entries(positions).map(([key, name]) => {
                return (
                  <option key={key} value={key}>
                    {name}
                  </option>
                );
              })}
            </select>
            <label htmlFor="homemade">
              Position<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="year"
              type="number"
              min="1950"
              max={new Date().getFullYear() + 1}
              step="1"
              id="year"
              onWheel={(e) => e.currentTarget.blur()}
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="2023"
            />
            <label htmlFor="price">
              Year<sup className="ml-1 text-red-500">*</sup>
            </label>
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
          Add award
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}
