import React from "react";
import { type LoaderFunctionArgs } from "@remix-run/node";
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

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserFromCookie(request, { optional: true })) as User;

  const userActions = await prisma.userAction.findMany();

  return {
    user,
    userActions,
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
  const { userActions, builders, investors, users } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
      <h1 className="text-4xl font-semibold">Shareholders</h1>
      <section className="px-4">
        <h2 className="mb-4 text-2xl">Stakeholders</h2>
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
                value: 1,
                color: "hsl(330, 70%, 50%)",
              },
              {
                id: "Investors",
                label: "Investors",
                value: 1,
                color: "hsl(201, 70%, 50%)",
              },
              {
                id: "Builders",
                label: "Builders",
                value: 1,
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
      </section>
      <section className="px-4">
        <h2 className="mb-4 text-2xl">Builders</h2>
        <p>
          The <b>shares of the Builders</b> are split equally between all the
          builders as per: one hour of work is one share.
        </p>
        <p>A Builder can do: code, design, marketing, sales, support, etc.</p>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            enableArcLinkLabels={false}
            data={builders[0].map((ua) => {
              return {
                id: (ua.user_email as string)[0].toLocaleUpperCase(),
                label: (ua.user_email as string)[0].toLocaleUpperCase(),
                value: ua.number_of_actions,
                color: `hsl(44, 100%, ${
                  50 + 50 - (ua.number_of_actions / builders[1]) * 50
                }%) `,
              };
            })}
          />
        </div>
      </section>
      <section className="px-4">
        <h2 className="mb-4 text-2xl">Investors</h2>
        <p>
          The <b>shares of the Builders</b> are split equally between all the
          builders as per: one hour of work is one share.
        </p>
        <p>A Builder can do: code, design, marketing, sales, support, etc.</p>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            enableArcLinkLabels={false}
            data={investors[0].map((ua) => {
              return {
                id: (ua.user_email as string)[0].toLocaleUpperCase(),
                label: (ua.user_email as string)[0].toLocaleUpperCase(),
                value: ua.number_of_actions,
                color: `hsl(201, 70%, ${
                  50 + 50 - (ua.number_of_actions / investors[1]) * 50
                }%) `,
              };
            })}
          />
        </div>
      </section>
      <section className="px-4">
        <h2 className="mb-4 text-2xl">Users</h2>
        <p>
          The <b>shares of the Builders</b> are split equally between all the
          builders as per: one hour of work is one share.
        </p>
        <p>A Builder can do: code, design, marketing, sales, support, etc.</p>
        <div className="flex h-96 w-full justify-center py-4">
          <ChartStakeholders
            enableArcLinkLabels={false}
            data={users[0].map((ua, index) => {
              return {
                id: ua.user_email,
                label: (ua.user_email as string)[0].toLocaleUpperCase(),
                value: ua.number_of_actions,
                color: `hsl(201, 70%, ${
                  50 + 50 - (ua.number_of_actions / users[1]) * 50
                }%) `,
              };
            })}
          />
        </div>
      </section>
      <Link className="underline" to="/">
        Go back home
      </Link>
    </div>
  );
}
