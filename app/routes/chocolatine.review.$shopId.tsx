import {
  ActionFunctionArgs,
  ActionFunction,
  json,
  redirect,
  LoaderFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import ShortUniqueId from "short-unique-id";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import parseGoogleLinkForCoordinates from "~/utils/parseGoogleLinkForCoordinates.server";
import {
  ModalBody,
  ModalFooter,
  ModalRouteContainer,
} from "~/components/Modal";
import { prisma } from "~/db/prisma.server";
import { getUserIdFromCookie } from "~/services/auth.server";
import Cookies from "js-cookie";

type ActionReturnType = {
  ok: boolean;
  error?: string;
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<ActionReturnType> => {
  // Here we can update our database with the new invoice
  const form = await request.formData();

  // This is just so we can see the transition
  return redirect(`/chocolatine`);
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
      shopId: params.shopId,
    },
  });
  return json({ shop, chocolatine });
};

export default function Add() {
  const actionData = useActionData<typeof action>();
  const { shop, chocolatine } = useLoaderData<typeof loader>();

  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return (
    <ModalRouteContainer
      aria-label={`Add new review for ${shop.name}'s ${chocolatineName}`}
      title={`Add new review for ${shop.name}'s ${chocolatineName}`}
    >
      <ModalBody>
        <Form id="add-review-form" method="post" className="m-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="price"
              type="number"
              id="price"
              required
              className="block w-full rounded border border-black bg-transparent p-2.5 text-black outline-app-500 transition-all placeholder:opacity-30 focus:ring-app-500"
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
            defaultValue={chocolatine?.buttery}
            legend="Buttery"
          >
            Some people like with A LOT, some other with just a touch. In any
            case, it's an important ingredient of the {chocolatineName}&nbsp;🧈
          </RadioRate>
          <RadioRate
            name="flaky_or_brioche"
            minCaption={"Flaky/Feuilleuté"}
            maxCaption={"Brioche"}
            defaultValue={chocolatine?.flaky_or_brioche}
            legend="Flaky/Feuilleuté or Brioche-like"
          >
            the original {chocolatineName} IS flaky. Butterly flaky. But it
            takes everything to make a world&nbsp;🤷
          </RadioRate>
          <RadioRate
            name="golden_or_pale"
            minCaption={"Golden"}
            maxCaption={"Pale"}
            defaultValue={chocolatine?.golden_or_pale}
            legend="Golden or Pale"
          >
            The more golden the more cooked.&nbsp;❤️‍🔥
          </RadioRate>
          <RadioRate
            name="crispy_or_soft"
            minCaption={"Crispy"}
            maxCaption={"Soft"}
            defaultValue={chocolatine?.crispy_or_soft}
            legend="Crispy or Soft"
          >
            A combinaison of buttery, flakiness and and time to cook&nbsp;🤯
          </RadioRate>
          <RadioRate
            name="light_or_dense"
            minCaption="Light"
            maxCaption="Dense"
            defaultValue={chocolatine?.light_or_dense}
            legend="Light or Dense"
          >
            This is a signature&nbsp;🧑‍🍳
          </RadioRate>
          <RadioRate
            name="chocolate_disposition"
            minCaption={"Superimposed"}
            maxCaption={"On each edges"}
            defaultValue={chocolatine?.chocolate_disposition}
            legend="Chocolate disposition"
          >
            superimposed or well distributed?&nbsp;🖖
          </RadioRate>
          <RadioRate
            name="big_or_small"
            minCaption={"Very small"}
            maxCaption={"Very big"}
            defaultValue={chocolatine?.big_or_small}
            legend="Big or small"
          >
            this is manly to point out the too small ones, tbh&nbsp;👎
          </RadioRate>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
            <input
              name="good_or_not_good"
              type="number"
              id="good_or_not_good"
              required
              className="block w-full rounded border border-black bg-transparent p-2.5 text-black outline-app-500 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="A score from 0 to 20"
              defaultValue={chocolatine?.good_or_not_good}
            />
            <label htmlFor="price">
              Good or not good?<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button type="submit" form="add-review-form">
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
  children: React.children;
}) {
  return (
    <div className="mb-3 flex max-w-lg flex-col-reverse gap-2">
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
                className="block h-4 w-4 grow-0  border-black bg-transparent p-2.5 text-app-500 outline-app-500 transition-all placeholder:opacity-30 focus:ring-app-500"
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
