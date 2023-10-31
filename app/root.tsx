import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
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

export function meta() {
  const url = "https://chocolatine.kiss-my.app";
  return [
    {
      title:
        "Kiss My Chocolatine - Find all the Pains au Chocolat all around the world 🌍",
    },
    {
      name: "description",
      content:
        "All about the Pains Au Chocolat in the world 🌍 The shops, the ingredients, the reviews",
    },
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
    { property: "og:image", content: `${url}/og-image-1200-630.jpg` },
    {
      property: "og:image:secure_url",
      content: `${url}/og-image-1200-630.jpg`,
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
    { property: "twitter:image", content: `${url}/og-image-1200-630.jpg` },
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
}

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
  { rel: "icon", type: "image/vnd.microsoft.icon", href: "/favicon.ico" },
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  { rel: "icon", sizes: "128x128", href: "/favicon.icns" },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "57x57",
    href: "/favicon-apple-touch-57.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "72x72",
    href: "/favicon-apple-touch-72.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "114x114",
    href: "/favicon-apple-touch-114.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "144x144",
    href: "/favicon.png",
  },
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
  console.log(error);
  return (
    <html lang="en" className="h-full w-full">
      <body>
        <div>Something went wrong</div>
      </body>
    </html>
  );
};

export default function App() {
  const { ENV } = useLoaderData<typeof loader>();

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
      <body className="relative h-full w-full overflow-hidden">
        <Outlet />

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
