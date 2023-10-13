import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import mapboxStyles from "mapbox-gl/dist/mapbox-gl.css";
import stylesheet from "~/styles/tailwind.css";
import { useEffect, useState } from "react";

export const meta: MetaFunction = ({ params, data }: MetaArgs) => {
  const url = "https://chocolatine.kiss-my.app";
  return [
    {
      property: "og:title",
      content:
        "Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
    {
      property: "og:description",
      content:
        "Ingredients, reviews, prices, shop's opening hours of all the Pains au Chocolat around the world.",
    },
    { property: "og:url", content: url },
    { property: "og:image", content: `${url}/og-image-1200-630.png` },
    {
      property: "og:image:secure_url",
      content: `${url}/og-image-1200-630.png`,
    },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    {
      property: "og:image:alt",
      content:
        "Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
    {
      property: "twitter:title",
      content:
        "Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
    {
      property: "twitter:description",
      content:
        "Ingredients, reviews, prices, shop's opening hours of all the Pains au Chocolat around the world.",
    },
    { property: "twitter:image", content: `${url}/og-image-1200-630.png` },
    {
      property: "twitter:image:alt",
      content:
        "Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
    { property: "twitter:card", content: "summary" },
    { property: "twitter:creator", content: "@arnaudambro" },
    { property: "twitter:site", content: "@arnaudambro" },
    { property: "twitter:url", content: url },
    { property: "og:type", content: "website" },
    { property: "apple-mobile-web-app-capable", content: "yes" },
    { property: "mobile-web-app-capable", content: "yes" },
    { property: "apple-mobile-web-app-status-bar-style", content: "#FFBB01" },
    { tagName: "link", rel: "canonical", href: url },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: mapboxStyles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: "manifest",
    type: "text/css",
    href: "/kiss-my-chocolatine.webmanifest",
  },
  { rel: "apple-touch-icon", href: "/assets/icon_512.png" },
];

declare global {
  interface Window {
    ENV: {
      MAPBOX_ACCESS_TOKEN: string;
    };
  }
}

export const loader = async () => {
  return {
    ENV: {
      MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    },
  };
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <div>Something went wrong</div>;
};

export default function App() {
  const { ENV } = useLoaderData();
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(window.atob("a2lzcy5teS5jaG9jb2xhdGluZUBnbWFpbC5jb20="));
  }, []);

  return (
    <html lang="en" className="h-full w-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <meta name="theme-color" content="#FFBB01" />
        <Meta />
        <Links />
      </head>
      <body className="h-full w-full">
        <Outlet context={email} />

        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <script
          defer
          data-domain="chocolatine.kiss-my.app"
          src="https://plausible.io/js/script.tagged-events.js"
        ></script>
        <LiveReload />
      </body>
    </html>
  );
}
