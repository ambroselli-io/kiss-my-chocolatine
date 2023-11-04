import React, { useState } from "react";
import {
  type MetaFunction,
  type MetaArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { NumericFormat } from "react-number-format";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserFromCookie } from "~/services/auth.server";
import type { User } from "@prisma/client";
import { prisma } from "~/db/prisma.server";
import type { Action } from "@prisma/client";
import {
  mapActionToShares,
  reduceAllDBActionsToShares,
} from "~/utils/mapActionToShares";
import ChartStakeholders from "~/components/ChartStakeholders";
import useChocolatineName from "~/utils/useChocolatineName";

export const meta: MetaFunction = ({ matches }: MetaArgs) => {
  const parentMeta = matches
    .flatMap((match) => match.meta ?? [])
    .filter((meta: any) => meta.property !== "og:image")
    .filter((meta: any) => meta.property !== "twitter:image")
    .filter((meta: any) => meta.property !== "twitter:image:alt")
    .filter((meta: any) => meta.property !== "og:image:secure_url")
    .filter((meta: any) => meta.property !== "og:image:alt");

  const url = "https://chocolatine.kiss-my.app";
  return [
    ...parentMeta,
    { property: "twitter:image", content: `${url}/shareholders_og.png` },
    {
      property: "twitter:image:alt",
      content:
        "Example of Shareholders dividens for Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
    { property: "og:image", content: `${url}/shareholders_og.png` },
    {
      property: "og:image:secure_url",
      content: `${url}/shareholders_og.png`,
    },
    {
      property: "og:image:alt",
      content:
        "Example of Shareholders dividens for Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserFromCookie(request, { optional: true })) as User;

  const userActions = await prisma.userAction.findMany();

  return {
    user,
    builders: reduceAllDBActionsToShares(userActions, ["BUILDER_HOUR_AMOUNT"]),
    investors: reduceAllDBActionsToShares(userActions, [
      "INVESTOR_EURO_AMOUNT",
    ]),
    users: reduceAllDBActionsToShares(
      userActions,
      (Object.keys(mapActionToShares) as Array<Action>).filter(
        (action) =>
          !["INVESTOR_EURO_AMOUNT", "BUILDER_HOUR_AMOUNT"].includes(action),
      ),
    ),
  };
}

export default function NewShareholderAction() {
  const { builders, investors, users, user } = useLoaderData<typeof loader>();

  const [email, setEmail] = useState(user?.email || "");
  const [benefits, setBenefits] = useState("1000000");

  const userSharholder = email
    ? users[0].find((ua) => ua.user_email === email)
    : null;
  const investor = email
    ? investors[0].find((ua) => ua.user_email === email)
    : null;
  const builder = email
    ? builders[0].find((ua) => ua.user_email === email)
    : null;

  const userBenefit = userSharholder
    ? Math.round(
        (Number(benefits) / 3) * (userSharholder?.number_of_actions / users[1]),
      )
    : 0;
  const investorBenefit = investor
    ? Math.round(
        (Number(benefits) / 3) * (investor?.number_of_actions / investors[1]),
      )
    : 0;
  const builderBenefit = builder
    ? Math.round(
        (Number(benefits) / 3) * (builder?.number_of_actions / builders[1]),
      )
    : 0;

  const { newAppName } = useChocolatineName();
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto bg-gray-50">
      <h1 className="bg-app-500 px-6 py-10 text-4xl font-semibold">
        {newAppName}'s Shareholders
      </h1>
      <details open className="border-b border-b-gray-300 px-8 pb-4">
        <summary className="mb-4 pl-4">
          <h2 className="inline-flex text-2xl">My Shares</h2>
        </summary>
        <p className="mb-4">
          We can simulate your shares based on your actions on the platform.
          Write your email below, and a potential company's benefit, and see how
          much you get in your pocket.
        </p>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            <div className="mb-3 flex flex-col-reverse gap-2">
              <input
                type="text"
                id="email"
                required
                autoCapitalize="off"
                className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
                placeholder="arnaud@ambroselli.io"
                onChange={(e) => setEmail(e.currentTarget.value)}
                value={email}
              />
              <label htmlFor="email">
                Email
                <sup className="ml-1 text-red-500">*</sup>
              </label>
            </div>
            <div className="mb-3 flex flex-col-reverse gap-2">
              <NumericFormat
                value={benefits}
                onValueChange={(values) => setBenefits(values.value)}
                thousandsGroupStyle="thousand"
                thousandSeparator=" "
                prefix={"€ "}
                id="company_benefit"
                required
                className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
                onBlur={(e) => e.currentTarget.blur()}
              />
              <label htmlFor="company_benefit">Company's benefit</label>
            </div>
          </div>
          {!!email && (
            <div className="mt-4 text-2xl">
              {!!userSharholder && (
                <div className="mb-2 flex items-center justify-between rounded border border-gray-200 bg-[#c73a7e] bg-opacity-5 p-3">
                  <div>
                    User's actions: <b>{userSharholder?.number_of_actions}</b>
                  </div>
                  <div>
                    Benefit:{" "}
                    <b>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(userBenefit)}
                    </b>
                  </div>
                </div>
              )}
              {!!builder && (
                <div className="mb-2 flex items-center justify-between rounded border border-gray-200 bg-[#f5be41] bg-opacity-5 p-3">
                  <div>
                    Builder's actions: <b>{builder?.number_of_actions}</b>
                  </div>
                  <div>
                    Benefit:{" "}
                    <b>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(investorBenefit)}
                    </b>
                  </div>
                </div>
              )}
              {!!investor && (
                <div className="mb-2 flex items-center justify-between rounded border border-gray-200 bg-[#4d98d3]  bg-opacity-5 p-3">
                  <div>
                    Investor's actions: <b>{investor?.number_of_actions}</b>
                  </div>
                  <div>
                    Benefit:{" "}
                    <b>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }).format(investorBenefit)}
                    </b>
                  </div>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between rounded border border-gray-200 p-3">
                <div>Total dividend: </div>
                <div>
                  <b>
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(userBenefit + builderBenefit + investorBenefit)}
                  </b>
                </div>
              </div>
            </div>
          )}
        </div>
      </details>
      <details
        aria-description="Stakeholders block"
        className="border-b border-b-gray-300 px-8 pb-4"
      >
        <summary className="mb-4 pl-4">
          <h2 className="inline-flex text-2xl">Stakeholders</h2>
        </summary>
        <p>
          The <b>shares of the company</b> are split equally between three
          stakeholders:
        </p>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            data={[
              {
                id: "Users",
                label: "Users",
                value: 33,
                color: "hsl(330, 70%, 50%)",
              },
              {
                id: "Investors",
                label: "Investors",
                value: 33,
                color: "hsl(201, 70%, 50%)",
              },
              {
                id: "Builders",
                label: "Builders",
                value: 33,
                color: "hsl(44, 100%, 50%)",
              },
            ]}
            legends={[
              {
                anchor: "top",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: -35,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </details>
      <details
        aria-description="Users block"
        className="border-b border-b-gray-300 px-8 pb-4"
      >
        <summary className="mb-4 pl-4">
          <h2 className="inline-flex text-2xl">
            Users ({users[1]} shares as of today)
          </h2>
        </summary>
        <p>
          There is an unlimited amount of Users shares. The more actions done,
          the more existing shares.
        </p>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            enableArcLinkLabels={false}
            onClick={(data) => setEmail(data.id)}
            data={users[0].map((ua, index) => {
              return {
                id: ua.user_email,
                label: (ua.user_email as string)[0].toLocaleUpperCase(),
                value: ua.number_of_actions,
                color: `hsl(330, 70%,  ${
                  25 + 50 - (ua.number_of_actions / (users[1] as number)) * 50
                }%) `,
              };
            })}
          />
        </div>
        <p>
          The <b>shares of the Users</b> are split equally between all the users
          as per:
        </p>
        <ul className="list-inside list-disc">
          {Object.entries(mapActionToShares).map(([action, value]) => {
            if (
              ["INVESTOR_EURO_AMOUNT", "BUILDER_HOUR_AMOUNT"].includes(action)
            ) {
              return null;
            }
            return (
              <li key={action}>
                {action.replace("USER_", "")}: {value} shares
              </li>
            );
          })}
        </ul>
      </details>
      <details
        aria-description="Builders block"
        className="border-b border-b-gray-300 px-8 pb-4"
      >
        <summary className="mb-4 pl-4">
          <h2 className="inline-flex text-2xl">
            Builders ({builders[1]} shares as of today)
          </h2>
        </summary>
        <p>
          There is an unlimited amount of Builders shares. The more hours
          worked, the more existing shares.
        </p>
        <p>
          The <b>shares of the Builders</b> are split equally between all the
          builders as per: one hour of work is one share.
        </p>
        <p>A Builder can do: code, design, marketing, sales, support, etc.</p>
        <p>A Builder's share last for 2 years.</p>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            enableArcLinkLabels={false}
            onClick={(data) => setEmail(data.id)}
            data={builders[0].map((ua) => {
              return {
                id: ua.user_email,
                label: (ua.user_email as string)[0].toLocaleUpperCase(),
                value: ua.number_of_actions,
                color: `hsl(44, 100%, ${
                  50 +
                  50 -
                  (ua.number_of_actions / (builders[1] as number)) * 50
                }%) `,
              };
            })}
          />
        </div>
      </details>
      <details
        aria-description="Investors block"
        className="border-b border-b-gray-300 px-8 pb-4"
      >
        <summary className="mb-4 pl-4">
          <h2 className="inline-flex text-2xl">
            Investors ({investors[1]} shares as of today)
          </h2>
        </summary>
        <h2 className="inline-flex text-2xl"></h2>
        <p>
          There is an unlimited amount of Investors shares. The more euros
          invested, the more existing shares.
        </p>
        <p>
          The <b>shares of the Investors</b> are split equally between all the
          investors as per
        </p>
        <ul className="list-inside list-disc">
          <li>The first 10.000€ invested are worth 100 shares per Euro</li>
          <li>The next 100.000€ invested are worth 10 shares per Euro</li>
          <li>The next ones worth 1 shares per Euro</li>
        </ul>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            enableArcLinkLabels={false}
            onClick={(data) => setEmail(data.id)}
            data={investors[0].map((ua) => {
              return {
                id: ua.user_email,
                label: (ua.user_email as string)[0].toLocaleUpperCase(),
                value: ua.number_of_actions,
                color: `hsl(201, 70%, ${
                  50 +
                  50 -
                  (ua.number_of_actions / (investors[1] as number)) * 50
                }%) `,
              };
            })}
          />
        </div>
      </details>
      <Link className="underline" to="/">
        Go back home
      </Link>
    </div>
  );
}
