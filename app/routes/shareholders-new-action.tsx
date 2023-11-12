import React from "react";
import {
  type LoaderFunctionArgs,
  redirect,
  ActionFunctionArgs,
  json,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { getUserFromCookie } from "~/services/auth.server";
import type { User } from "@prisma/client";
import { prisma } from "~/db/prisma.server";
import type { Action, UserAction } from "@prisma/client";
import { mapActionToShares } from "~/utils/mapActionToShares";
import AutoCompleteInput from "~/components/AutoCompleteInput";

export async function action({ request }: ActionFunctionArgs) {
  const user = (await getUserFromCookie(request)) as User;
  if (!user?.admin) return redirect("/404");

  const form = await request.formData();
  const action = form.get("action") as Action;
  const numberOfActions = form.get("number_of_actions") as string;
  const user_email = form.get("user_email") as string;

  const actionUser = await prisma.user.findUnique({
    where: {
      email: user_email,
    },
  });

  const userAction = await prisma.userAction.create({
    data: {
      user_email,
      number_of_actions: parseInt(numberOfActions),
      user_id: actionUser?.id ? actionUser.id : undefined,
      action,
    },
  });

  return json({ ok: true, data: userAction });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = (await getUserFromCookie(request)) as User;
  if (!user?.admin) return redirect("/404");

  const usersEmails = await prisma.$queryRaw<
    Array<UserAction>
  >`SELECT DISTINCT user_email FROM "UserAction"`;
  return {
    usersEmails: usersEmails.map((user) => user.user_email),
  };
}

export default function NewShareholderAction() {
  const { state } = useNavigation();
  const { usersEmails } = useLoaderData<typeof loader>();
  const busy = state === "submitting";

  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Shareholders action</h1>
      <Form method="post">
        <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
          <select
            id="action"
            name="action"
            required
            className="block w-full rounded-md border-0 p-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-app-500 sm:text-sm sm:leading-6"
          >
            {Object.keys(mapActionToShares).map((action) => {
              return (
                <option key={action} value={action}>
                  {action}
                </option>
              );
            })}
          </select>
          <label htmlFor="action">
            Action<sup className="ml-1 text-red-500">*</sup>
          </label>
        </div>
        <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
          <input
            name="number_of_actions"
            type="number"
            min="0"
            step="1"
            id="number_of_actions"
            onWheel={(e) => e.currentTarget.blur()}
            required
            className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
            placeholder="1"
            defaultValue={1}
          />
          <label htmlFor="number_of_actions">
            Number of times the action has been done
            <sup className="ml-1 text-red-500">*</sup>
          </label>
        </div>
        <AutoCompleteInput
          items={usersEmails}
          label="User email"
          key={actionData?.data.id}
          name="user_email"
          type="email"
          id="user_email"
          autoCapitalize="off"
          required
          className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
          placeholder="lol@email.com"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#FFBB01] px-4 py-2 disabled:opacity-25"
          disabled={busy}
        >
          Add user action
        </button>
      </Form>
      <Link className="underline" to="/">
        Go back home
      </Link>
    </div>
  );
}
