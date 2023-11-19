import { useRouteError } from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";

export default function Error404() {
  const error = useRouteError();

  // If error capture is implemented
  if (error) {
    captureRemixErrorBoundaryError(error);
    console.log(error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-50">
      <div className="text-center">
        <img
          src="/assets/error-page.png"
          alt="Oups!"
          className="mx-auto mb-8 max-w-xs"
        />
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Oups! Quelque chose s'est mal passé...
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          Il semble qu'il y ait une erreur avec notre app. Soyez patient pendant
          que nous la résolvons !
        </p>
        <a
          href="/"
          className="inline-block rounded bg-app-500 px-4 py-2 text-sm font-semibold  hover:bg-app-600"
        >
          Retourner à l'accueil
        </a>
      </div>
    </div>
  );
}
