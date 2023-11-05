import {
  ActionFunctionArgs,
  redirect,
  LoaderFunctionArgs,
  LoaderFunction,
  json,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  ModalBody,
  ModalFooter,
  ModalRouteContainer,
} from "~/components/Modal";
import { prisma } from "~/db/prisma.server";
import {
  getUserEmailFromCookie,
  getUserFromCookie,
  getUserIdFromCookie,
} from "~/services/auth.server";
import {
  adminEMail,
  friendInvitedEmail,
  friendToInviteEmail,
  sendEmail,
} from "~/services/email.server";
import { mapActionToShares } from "~/utils/mapActionToShares";
import useChocolatineName from "~/utils/useChocolatineName";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Here we can update our database with the new invoice
  const form = await request.formData();
  const user_referral_creater = form.get("user_referral_creater") as string;
  const chocolatine_name = form.get("chocolatine_name") as string;
  const userId = await getUserIdFromCookie(request);
  const userEmail = await getUserEmailFromCookie(request);

  if (!user_referral_creater) {
    return json({
      ok: false,
      error: "You need to provide an email",
      data: null,
    });
  }

  await prisma.userAction.create({
    data: {
      action: "USER_REFERRAL_CREATER",
      user_id: userId,
      number_of_actions: 1,
      user_email: userEmail,
    },
  });
  await prisma.userAction.create({
    data: {
      action: "USER_REFERRAL_RECEIVER",
      number_of_actions: 1,
      user_email: user_referral_creater,
    },
  });

  const admin = await prisma.user.findFirst({
    where: {
      admin: true,
    },
  });

  sendEmail(
    friendToInviteEmail(userEmail, user_referral_creater, chocolatine_name),
  ).then(console.log);
  sendEmail(friendInvitedEmail(userEmail, user_referral_creater)).then(
    console.log,
  );
  if (admin?.email)
    sendEmail(adminEMail(userEmail, user_referral_creater, admin?.email)).then(
      console.log,
    );

  return json({ ok: true, error: "", data: { id: user_referral_creater } });
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  await getUserFromCookie(request, {
    failureRedirect: "/chocolatine/register?redirect=/chocolatine/referral",
  });
  return { mapActionToShares };
};

export default function AddNewShop() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const actionData = useActionData<typeof action>();
  const { mapActionToShares } = useLoaderData<typeof loader>();

  const { chocolatineName } = useChocolatineName();

  return (
    <ModalRouteContainer aria-label="Invite friend" title="Invite friend">
      <ModalBody>
        <Form id="referral-form" method="post" className="m-4">
          <p className="mb-6">
            Invite your friends here.
            <br />
            For each friend registered, you will get{" "}
            {mapActionToShares.USER_REFERRAL_CREATER} extra shares.
          </p>
          <input
            type="hidden"
            name="chocolatine_name"
            value={chocolatineName}
          />
          <div
            className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left"
            key={actionData?.data?.id}
          >
            <input
              name="user_referral_creater"
              type="email"
              id="user_referral_creater"
              autoCapitalize="off"
              required
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="An email of your friend"
            />
            <label htmlFor="user_referral_creater">
              User email<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          {actionData?.ok && actionData?.data?.id && (
            <p className="text-sm text-gray-500">
              {actionData?.data.id} has been invited! 🎉
            </p>
          )}
          {actionData?.error && (
            <p className="text-sm text-red-500">{actionData?.error}</p>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <button
          type="submit"
          className="rounded-lg bg-[#FFBB01] px-4 py-2 disabled:opacity-25"
          form="referral-form"
          disabled={busy}
        >
          Invite friend
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}
