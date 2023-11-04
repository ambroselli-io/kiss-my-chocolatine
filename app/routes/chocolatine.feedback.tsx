import {
  ActionFunctionArgs,
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
  getUserIdFromCookie,
} from "~/services/auth.server";
import { feedbackEmail, sendEmail } from "~/services/email.server";
import { newFeedback } from "~/utils/emails";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Here we can update our database with the new invoice
  const form = await request.formData();
  const feedback = form.get("feedback") as string;
  const user_email_from_form = form.get("user_email") as string;
  const userId = await getUserIdFromCookie(request, {
    optional: true,
  });
  const userEmailFromCookie = await getUserEmailFromCookie(request, {
    optional: true,
  });

  if (!feedback) {
    return json({
      ok: false,
      error: "You need to provide an email",
    });
  }

  await prisma.userAction.create({
    data: {
      action: "FEEDBACK",
      user_id: userId,
      number_of_actions: 1,
      user_email: userEmailFromCookie ?? user_email_from_form,
    },
  });

  const admin = await prisma.user.findFirst({
    where: {
      admin: true,
    },
  });

  sendEmail(
    feedbackEmail(
      feedback,
      userEmailFromCookie ?? user_email_from_form,
      admin?.email as string,
    ),
  ).then(console.log);

  return json({ ok: true });
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const userEmail = await getUserEmailFromCookie(request, { optional: true });
  return { userEmail };
};

export default function AddNewShop() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const actionData = useActionData<typeof action>();
  const { userEmail } = useLoaderData<typeof loader>();

  return (
    <ModalRouteContainer aria-label="Feedback" title="I have something to say">
      <ModalBody>
        <Form id="referral-form" method="post" className="m-4">
          <p className="mb-6">
            Any feedback? Good, bad, review, wrong or missing information...
          </p>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <textarea
              name="feedback"
              id="feedback"
              required
              rows={userEmail ? 7 : 3}
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
              placeholder="Kiss My Chocolatine is great but..."
            />
            <label htmlFor="feedback">
              Feedback<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          {!userEmail && (
            <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
              <input
                name="user_email"
                type="email"
                id="user_email"
                autoCapitalize="off"
                required
                className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:ring-app-500"
                placeholder="So that we can reach you back"
              />
              <label htmlFor="user_email">
                Your email<sup className="ml-1 text-red-500">*</sup>
              </label>
            </div>
          )}
          {actionData?.ok && <p className="text-sm text-gray-500">Merci! 🎉</p>}
          {actionData?.error && (
            <p className="text-sm text-red-500">
              {actionData?.error}. If the error persists, please{" "}
              <a href={newFeedback()} className="px-4 py-2">
                click here to send a feedback by email.
              </a>
            </p>
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
          Send my feedback!
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}
