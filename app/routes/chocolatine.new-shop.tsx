import {
  ActionFunctionArgs,
  redirect,
  LoaderFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import parseGoogleLinkForCoordinates from "~/utils/parseGoogleLinkForCoordinates.server";
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
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { readableHomemade } from "~/utils/homemade";

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
  const coordinates = form.get("coordinates") as string | null | undefined;
  const description = form.get("description") as string | null | undefined;
  const shopName = form.get("shop_name") as string;
  const addressLocality = form.get("addressLocality") as string;
  const homemade = form.get("homemade");
  const price = form.get("price");

  const userId = await getUserIdFromCookie(request);
  const userEmail = await getUserEmailFromCookie(request);

  // google link can be
  // -> https://maps.app.goo.gl/2PScR6bSNXJUyns57
  // ->https://www.google.com/maps/place/Le+Pain+Retrouvé/@48.8777186,2.3396138,17z/data=!3m2!4b1!5s0x47e66e473872ba6b:0xf7d926070e69fc39!4m6!3m5!1s0x47e66f897294d69b:0x37816e98cb091727!8m2!3d48.8777186!4d2.3396138!16s%2Fg%2F11qqj676ry?entry=ttu

  const shop = await prisma.$transaction(async (tx) => {
    let latitude = null;
    let longitude = null;
    try {
      if (coordinates) {
        [latitude, longitude] = coordinates.split(",").map(Number);
      } else if (googleLink) {
        const googleParsing = await parseGoogleLinkForCoordinates(googleLink);
        latitude = googleParsing.latitude;
        longitude = googleParsing.longitude;
      }
    } catch (e) {
      Sentry.captureException(e, { extra: { googleLink, coordinates } });
    }
    const shop = await tx.shop.create({
      data: {
        name: shopName,
        description,
        addressLocality,
        google_map_link: googleLink,
        latitude,
        longitude,
        created_by_user_id: userId,
        created_by_user_email: userEmail,
      },
    });
    await tx.userAction.create({
      data: {
        action: "USER_SHOP_NEW",
        user_id: userId,
        number_of_actions: 1,
        user_email: userEmail,
      },
    });

    await tx.chocolatine.create({
      data: {
        shop_id: shop.id,
        shop_name: shop.name,
        created_by_user_id: userId,
        created_by_user_email: userEmail,
        homemade: String(homemade),
        price: Number(price),
      },
    });

    return shop;
  });

  return redirect(`/chocolatine/${shop.id}`);
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
  const [searchParams] = useSearchParams();

  return (
    <ModalRouteContainer
      aria-label="Ajoutez un magasin"
      title="Ajoutez un magasin"
    >
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
              defaultValue={searchParams.get("name") ?? undefined}
            />
            <label htmlFor="shop_name">
              Nom<sup className="ml-1 text-red-500">*</sup>
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
              Ville<sup className="ml-1 text-red-500">*</sup>
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
                <label
                  htmlFor="google_map_link"
                  className="inline-flex items-center gap-x-2"
                >
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    className="inline-flex items-center gap-x-2"
                    rel="noopener noreferrer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                    Lien Google Maps
                  </a>
                </label>
              </summary>
              <p className="pl-4 text-sm opacity-40">
                On vous demande un lien Google Maps parce qu'il contient toutes
                les informations dont on a besoin: adresse, email, numéro de
                téléphone, horaires d'ouverture, et coordonnées. Ce serait très
                gentil de votre part de le copier-coller ici en dessous:
              </p>
            </details>
          </div>
          <p className="mb-4 px-4 text-sm opacity-40">
            Ou, si vous ne voulez <i>vraiiiment pas</i> aller sur Google Maps et
            que vous êtes sûr de vos coordonnées:
          </p>
          <div className="mb-3 flex max-w-screen-lg flex-col-reverse gap-2">
            <input
              name="coordinates"
              type="text"
              id="coordinates"
              title="Coordinates (like `45.540596,2.493823`)"
              pattern="-?\d{1,3}\.\d+,-?\d{1,3}\.\d+"
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 valid:bg-green-50 invalid:bg-red-50 empty:!bg-white focus:border-app-500 focus:ring-app-500"
              placeholder="45.540596,2.493823"
              defaultValue={searchParams.get("coordinates") ?? undefined}
            />
            <details className="question text-left">
              <summary>
                <label
                  htmlFor="coordinates"
                  className="inline-flex items-center gap-x-2"
                >
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    className="inline-flex items-center gap-x-2"
                    rel="noopener noreferrer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                    Coordonnées{" "}
                    <span className="opacity-40">
                      (like "45.540596,2.493823")
                    </span>
                  </a>
                </label>
              </summary>
              <p className="pl-4 text-sm opacity-40">
                Vous avez deux options pour trouver les coordonnées: cliquez
                droit sur notre carte ou cliquez droit sur Google Maps.
              </p>
            </details>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <select
              id="homemade"
              name="homemade"
              required
              className="block w-full rounded-md border-0 p-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-app-500 sm:text-sm sm:leading-6"
            >
              {Object.entries(readableHomemade).map(([value, label]) => {
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            <label htmlFor="homemade">
              Fait maison&nbsp;?<sup className="ml-1 text-red-500">*</sup>
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
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="1.50"
            />
            <label htmlFor="price">Prix</label>
          </div>
          <div className="mb-3 flex max-w-lg flex-col-reverse gap-2 text-left">
            <input
              name="description"
              type="text"
              id="description"
              className="block w-full rounded-md border-0 bg-transparent p-2.5 text-black outline-app-500 ring-1 ring-inset ring-gray-300 transition-all placeholder:opacity-30 focus:border-app-500 focus:ring-app-500"
              placeholder="Une courte description"
            />
            <label htmlFor="description">Description</label>
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
          Ajoutez ce magasin
        </button>
      </ModalFooter>
    </ModalRouteContainer>
  );
}
