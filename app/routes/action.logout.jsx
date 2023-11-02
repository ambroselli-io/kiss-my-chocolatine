import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "../services/auth.server";

export const action = async ({ request }) => {
  console.log("action.logout.jsx");
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    status: 303,
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export default () => null;
