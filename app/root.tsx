import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import "mapbox-gl/dist/mapbox-gl.css";
import "~/styles/tailwind.css";
import Cookies from "js-cookie";

export function meta() {
  const url = "https://chocolatine.kiss-my.app";
  return [
    {
      title: "Kiss My Chocolatine - On veut des pains au chocolat faits maison !",
    },
    {
      property: "og:title",
      content: "Kiss My Chocolatine - On veut des pains au chocolat faits maison !",
    },
    {
      property: "twitter:title",
      content: "Kiss My Chocolatine - On veut des pains au chocolat faits maison !",
    },
    {
      property: "og:description",
      content: "Tous les pains au chocolat du monde entier 🌍 Les magasins, les ingrédients",
    },
    {
      name: "description",
      content: "Tous les pains au chocolat du monde entier 🌍 Les magasins, les ingrédients",
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
      content: "Kiss My Chocolatine - On veut des pains au chocolat faits maison !",
    },
    {
      property: "twitter:description",
      content: "Tous les pains au chocolat du monde entier 🌍 Les magasins, les ingrédients",
    },
    { property: "twitter:image", content: `${url}/og-image-1200-630.jpg` },
    {
      property: "twitter:image:alt",
      content: "Kiss My Chocolatine - On veut des pains au chocolat faits maison !",
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
  {
    rel: "manifest",
    type: "application/manifest+json",
    href: "/kiss-my-chocolatine.webmanifest",
  },
  { rel: "apple-touch-icon", href: "/assets/icon_512.png" },
  { rel: "icon", type: "image/vnd.microsoft.icon", href: "/favicon.ico" },
  { rel: "icon", type: "image/png", href: "/favicon.png" },
  { rel: "icon", sizes: "128x128", href: "/favicon.icns" },
  {
    rel: "apple-touch-icon",
    sizes: "57x57",
    href: "/favicon-apple-touch-57.png",
  },
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
  const chocolatineName = Cookies.get("chocolatine-name") || "chocolatine";
  const chocolatinesName = Cookies.get("chocolatines-name") || "chocolatines";
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const capitalizedChocolatineName = chocolatineName.split(" ").map(capitalize).join("\u00A0");
  // const newAppName = `Kiss\u00A0My\u00A0${"chocolatine"
  const newAppName = `Kiss\u00A0My\u00A0${capitalizedChocolatineName}`;

  return {
    ENV: {
      MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
    },
    custom: {
      chocolatineName,
      chocolatinesName,
      capitalizedChocolatineName,
      newAppName,
    },
  };
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    captureRemixErrorBoundaryError(error);
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

function App() {
  const { ENV, custom } = useLoaderData<typeof loader>();

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
        <Outlet context={custom} />

        <ScrollRestoration />
        <LiveReload />
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
      </body>
    </html>
  );
}

export default withSentry(App);
