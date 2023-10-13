import {
  type MetaFunction,
  type LoaderFunctionArgs,
  type MetaArgs,
  redirect,
} from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect("/chocolatine");
};

export default function Index() {
  return null;
}
