import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect("/chocolatine");
};

export default function Index() {
  return null;
}
