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
import { readableAwards, readablePositions } from "~/utils/awards";
import { isOpenedNow } from "~/utils/isOpenedNow";

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
    failureRedirect: `/${params.product}/register?redirect=${
      new URL(request.url).pathname
    }`,
  })) as User;
  if (!user) return { ok: false, error: "user doesnt exist" };
  const shop = await prisma.shop.findUnique({
    where: {
      id: params.shopId,
    },
  });

  if (!shop) return { ok: false, error: "shop doesnt exist" };
  const form = await request.formData();
  function getHoursFromDay(index: number) {
    const isClosed = form.get(`${index}-closed`) === "on";
    if (isClosed) return [null, null];
    const openingHour = form.get(`${index}-opening-hour`);
    const openingMinute = form.get(`${index}-opening-minute`);
    const closingHour = form.get(`${index}-closing-hour`);
    const closingMinute = form.get(`${index}-closing-minute`);
    if (!openingHour?.length || !openingMinute?.length)
      throw new Error("Missing opening hour or minute");
    if (!closingHour?.length || !closingMinute?.length)
      throw new Error("Missing closing hour or minute");
    return [
      `${openingHour}:${String(openingMinute).padEnd(2, "0")}`,
      `${closingHour}:${String(closingMinute).padEnd(2, "0")}`,
    ];
  }

  const mondayHours = getHoursFromDay(0);
  const tuesdayHours = getHoursFromDay(1);
  const wednesdayHours = getHoursFromDay(2);
  const thursdayHours = getHoursFromDay(3);
  const fridayHours = getHoursFromDay(4);
  const saturdayHours = getHoursFromDay(5);
  const sundayHours = getHoursFromDay(6);

  await prisma.shop.update({
    where: {
      id: shop.id,
    },
    data: {
      opening_hours_monday_open: mondayHours[0],
      opening_hours_monday_close: mondayHours[1],
      opening_hours_tuesday_open: tuesdayHours[0],
      opening_hours_tuesday_close: tuesdayHours[1],
      opening_hours_wednesday_open: wednesdayHours[0],
      opening_hours_wednesday_close: wednesdayHours[1],
      opening_hours_thursday_open: thursdayHours[0],
      opening_hours_thursday_close: thursdayHours[1],
      opening_hours_friday_open: fridayHours[0],
      opening_hours_friday_close: fridayHours[1],
      opening_hours_saturday_open: saturdayHours[0],
      opening_hours_saturday_close: saturdayHours[1],
      opening_hours_sunday_open: sundayHours[0],
      opening_hours_sunday_close: sundayHours[1],
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

  return redirect(`/${params.product}/${shop.id}?revalidate=true`);
};

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const userId = await getUserIdFromCookie(request, {
    failureRedirect: `/${params.product}/register?redirect=${
      new URL(request.url).pathname
    }`,
  });
  const shop = await prisma.shop.findUnique({
    where: {
      id: params.shopId,
    },
    select: {
      id: true,
      name: true,
      opening_hours_monday_open: true,
      opening_hours_monday_close: true,
      opening_hours_tuesday_open: true,
      opening_hours_tuesday_close: true,
      opening_hours_wednesday_open: true,
      opening_hours_wednesday_close: true,
      opening_hours_thursday_open: true,
      opening_hours_thursday_close: true,
      opening_hours_friday_open: true,
      opening_hours_friday_close: true,
      opening_hours_saturday_open: true,
      opening_hours_saturday_close: true,
      opening_hours_sunday_open: true,
      opening_hours_sunday_close: true,
    },
  });
  return json({ shop });
};

export default function AddOpeningHours() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const { shop } = useLoaderData<typeof loader>();
  const DAYS = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ];

  const { hasNoHours } = isOpenedNow(shop);

  const resetLine =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      // empty line if closed
      if (e.target.checked) {
        const openingHourInput = document.querySelector(
          `input[name="${index}-opening-hour"]`,
        );
        if (openingHourInput) {
          (openingHourInput as HTMLInputElement).value = "";
          (openingHourInput as HTMLInputElement).required = false;
        }
        const openingMinuteInput = document.querySelector(
          `input[name="${index}-opening-minute"]`,
        );
        if (openingMinuteInput) {
          (openingMinuteInput as HTMLInputElement).value = "";
          (openingMinuteInput as HTMLInputElement).required = false;
        }
        const closingHourInput = document.querySelector(
          `input[name="${index}-closing-hour"]`,
        );
        if (closingHourInput) {
          (closingHourInput as HTMLInputElement).value = "";
          (closingHourInput as HTMLInputElement).required = false;
        }
        const closingMinuteInput = document.querySelector(
          `input[name="${index}-closing-minute"]`,
        );
        if (closingMinuteInput) {
          (closingMinuteInput as HTMLInputElement).value = "";
          (closingMinuteInput as HTMLInputElement).required = false;
        }
      }
    };

  const copyLine = (index: number) => () => {
    const openingHour = (
      document.querySelector(
        `input[name="${index}-opening-hour"]`,
      ) as HTMLInputElement
    )?.value;
    const openingMinute = (
      document.querySelector(
        `input[name="${index}-opening-minute"]`,
      ) as HTMLInputElement
    )?.value;
    const closingHour = (
      document.querySelector(
        `input[name="${index}-closing-hour"]`,
      ) as HTMLInputElement
    )?.value;
    const closingMinute = (
      document.querySelector(
        `input[name="${index}-closing-minute"]`,
      ) as HTMLInputElement
    )?.value;

    for (let i = 0; i < DAYS.length; i++) {
      const openingHourInput = document.querySelector(
        `input[name="${i}-opening-hour"]`,
      );
      if (openingHourInput) {
        (openingHourInput as HTMLInputElement).value = openingHour;
      }
      const openingMinuteInput = document.querySelector(
        `input[name="${i}-opening-minute"]`,
      );
      if (openingMinuteInput) {
        (openingMinuteInput as HTMLInputElement).value = openingMinute;
      }
      const closingHourInput = document.querySelector(
        `input[name="${i}-closing-hour"]`,
      );
      if (closingHourInput) {
        (closingHourInput as HTMLInputElement).value = closingHour;
      }
      const closingMinuteInput = document.querySelector(
        `input[name="${i}-closing-minute"]`,
      );
      if (closingMinuteInput) {
        (closingMinuteInput as HTMLInputElement).value = closingMinute;
      }
    }
  };

  return (
    <ModalRouteContainer
      aria-label={`Ajoutez les horaires d'ouverture pour ${shop.name}`}
      title={`Ajoutez les horaires d'ouverture pour ${shop.name}`}
      size="full"
    >
      <ModalBody className="border-t border-t-gray-300">
        <Form
          id="add-opening-hours-form"
          method="post"
          className="m-4 min-w-max"
        >
          <div className="mb-3 grid grid-cols-7 items-center justify-center gap-4">
            <div></div> {/* Empty cell for alignment */}
            <div>Closed?</div>
            <div>Opening hour</div>
            <div>Opening minute</div>
            <div>Closing hour (24H)</div>
            <div>Closing minute</div>
            <div></div>
            {DAYS.map(({ key, label }, index) => {
              const isDefaultClosed =
                !hasNoHours && shop[`opening_hours_${key}_open`] === null;
              return (
                <React.Fragment key={key}>
                  <div>{label}</div>
                  <input
                    type="checkbox"
                    name={`${index}-closed`}
                    className="mt-2 h-4 w-4 rounded border-0 text-indigo-600 ring-1 ring-inset ring-gray-300 focus:border-app-500 focus:ring-app-500"
                    onChange={resetLine(index)}
                    defaultChecked={isDefaultClosed}
                  />
                  <input
                    name={`${index}-opening-hour`}
                    type="number"
                    min="0"
                    step="1"
                    max="24"
                    required={!isDefaultClosed}
                    className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
                    defaultValue={
                      shop[`opening_hours_${key}_open`]?.split(":")?.[0]
                    }
                  />
                  <input
                    name={`${index}-opening-minute`}
                    type="number"
                    min="0"
                    step="5"
                    max="60"
                    required={!isDefaultClosed}
                    className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
                    defaultValue={
                      shop[`opening_hours_${key}_open`]?.split(":")?.[1]
                    }
                  />
                  <input
                    name={`${index}-closing-hour`}
                    type="number"
                    min="0"
                    step="1"
                    max="24"
                    required={!isDefaultClosed}
                    className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
                    defaultValue={
                      shop[`opening_hours_${key}_close`]?.split(":")?.[0]
                    }
                  />
                  <input
                    name={`${index}-closing-minute`}
                    type="number"
                    min="0"
                    step="5"
                    max="60"
                    required={!isDefaultClosed}
                    className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
                    defaultValue={
                      shop[`opening_hours_${key}_close`]?.split(":")?.[1]
                    }
                  />
                  <button
                    className="text-xs text-gray-400"
                    type="button"
                    onClick={copyLine(index)}
                  >
                    copy this to all days
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button
          type="submit"
          form="add-opening-hours-form"
          className="rounded-lg bg-[#FFBB01] px-4 py-2 disabled:opacity-25"
          disabled={busy}
        >
          Add opening hours
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}
