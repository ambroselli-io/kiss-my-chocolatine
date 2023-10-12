import {
  type MetaFunction,
  type LoaderFunctionArgs,
  type MetaArgs,
  redirect,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Kiss my Chocolatine" },
    { name: "description", content: 'All the best "pains au chocolat" of Amsterdam!' },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  return redirect("/chocolatine");
};

export default function Index() {
  return null;
}
