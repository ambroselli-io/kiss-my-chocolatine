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
  useNavigation,
} from "@remix-run/react";
import parseGoogleLinkForCoordinates from "~/utils/parseGoogleLinkForCoordinates.server";
import {
  ModalBody,
  ModalFooter,
  ModalRouteContainer,
} from "~/components/Modal";
import { prisma } from "~/db/prisma.server";
import { getUserFromCookie, getUserIdFromCookie } from "~/services/auth.server";

type ActionReturnType = {
  ok: boolean;
  error?: string;
};

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<ActionReturnType> => {
  // Here we can update our database with the new invoice
  const form = await request.formData();
  const googleLink = form.get("google_map_link") as string | null | undefined;
  const shopName = form.get("shop_name") as string;
  const addressLocality = form.get("addressLocality") as string;
  const userId = await getUserIdFromCookie(request);

  // google link can be
  // -> https://maps.app.goo.gl/2PScR6bSNXJUyns57
  // ->https://www.google.com/maps/place/Le+Pain+Retrouvé/@48.8777186,2.3396138,17z/data=!3m2!4b1!5s0x47e66e473872ba6b:0xf7d926070e69fc39!4m6!3m5!1s0x47e66f897294d69b:0x37816e98cb091727!8m2!3d48.8777186!4d2.3396138!16s%2Fg%2F11qqj676ry?entry=ttu

  const { latitude, longitude } =
    await parseGoogleLinkForCoordinates(googleLink);

  const shop = await prisma.shop.create({
    data: {
      name: shopName,
      addressLocality,
      google_map_link: googleLink,
      latitude,
      longitude,
      created_by_user_id: userId,
    },
  });

  // This is just so we can see the transition
  return redirect(`/chocolatine/review/${shop.id}`);
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  await getUserFromCookie(request, {
    failureRedirect: "/chocolatine/register?redirect=/chocolatine/new-shop",
  });
  return null;
};

export default function AddNewShop() {
  const { state } = useNavigation();
  const busy = state === "submitting";
  const actionData = useActionData<typeof action>();

  return (
    <ModalRouteContainer aria-label="Add new shop" title="Add new shop">
      <ModalBody>
        <Form id="add-shop-form" method="post" className="m-4">
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="shop_name"
              type="text"
              id="shop_name"
              required
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="La Boulangerie trop bonne"
            />
            <label htmlFor="shop_name">
              Name<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="addressLocality"
              type="text"
              id="addressLocality"
              required
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="Paris"
            />
            <label htmlFor="addressLocality">
              City<sup className="ml-1 text-red-500">*</sup>
            </label>
          </div>
          <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
            {actionData?.error && (
              <p className="px-4 text-sm text-red-500">{actionData.error}</p>
            )}
            <input
              name="google_map_link"
              type="text"
              id="google_map_link"
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="https://maps.app.goo.gl/tue6ejyGQ66oHfVH7"
            />
            <details className="question text-left">
              <summary>
                <label htmlFor="google_map_link">Google Maps link</label>
              </summary>
              <p className="pl-4 text-sm opacity-40">
                We're interested in the Google Maps link because it provides all
                the information we need: address, email, phone number, opening
                hours, and coordinates. It would be very nice if you could paste
                it here below:
              </p>
            </details>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button
          type="submit"
          className="rounded-lg bg-[#FFBB01] px-4 py-2 disabled:opacity-25"
          form="add-shop-form"
          disabled={busy}
        >
          Add shop
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}
