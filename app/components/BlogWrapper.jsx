import React from "react";
import { Link } from "@remix-run/react";

export default function BlogWrapper({ children }) {
  return (
    <div
      id="blog-post"
      className="inset-0 z-20 flex h-full w-full flex-col overflow-y-auto bg-white md:relative md:inset-auto [&_ol]:mb-5 [&_ol]:pl-3 [&_p]:relative [&_p]:mb-5 [&_p]:px-1"
    >
      <div className="relative mt-6 flex-1 grow-0">
        <div className="mx-auto max-w-prose px-2 py-5">{children}</div>
        <div className="flex w-full items-center justify-center py-10">
          <Link
            to="/"
            className="flex justify-center rounded-md bg-app-900 px-3 py-1.5 text-lg font-semibold leading-6 text-white hover:bg-app-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-700"
          >
            Give it a try !
          </Link>
        </div>
      </div>
      {/* <div className="sticky bottom-0 left-0 right-0 mt-6 flex w-full items-center justify-center border-t border-gray-100 bg-white p-2.5 drop-shadow-md">
        <Link
          to="/"
          className="flex justify-center rounded-md bg-app-900 px-3 py-1.5 text-lg font-semibold leading-6 text-white hover:bg-app-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-700">
          Give it a try !
        </Link>
      </div> */}
    </div>
  );
}
