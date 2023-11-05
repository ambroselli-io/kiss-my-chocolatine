import React from "react";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import useChocolatineName from "~/utils/useChocolatineName";
import fs from "fs";
import { getUserFromCookie } from "~/services/auth.server";
// Mix of
// https://tailwindui.com/components/application-ui/overlays/slide-overs#component-3e8348c3c183bd14fceb018d4cca1942 - With background overlay
// https://tailwindui.com/components/application-ui/overlays/slide-overs#component-ccd8d99d511d401f103d95b4cc04b31a - Wide empty

// TS loader

export const loader = async ({ request, params }) => {
  // list all files from fs with blog in the name
  const user = await getUserFromCookie(request, { optional: true });
  const posts = fs.readdirSync("app/routes").filter((file) => {
    if (file.includes("blog.jsx")) return false;
    if (!file.includes("blog")) return false;
    if (file.includes("unpublished")) return false;
    return true;
  });

  return {
    userId: user?.id,
    user,
    posts,
  };
};

// https://tailwindui.com/components/application-ui/data-display/calendars#component-c6e8b2bf7f65e8987b7012d3bbe5caf1
// https://tailwindui.com/components/application-ui/lists/stacked-lists#component-0e46de7c930770b339e15800282bbc37

function Blog() {
  const { posts } = useLoaderData();
  const { newAppName } = useChocolatineName();

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="flex flex-col justify-between gap-2 bg-app-500 px-6 py-10 sm:flex-row">
        <h1 className="text-4xl font-semibold">{newAppName}'s Blog</h1>
        <Link className="underline" to="/">
          Go back home
        </Link>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full w-full overflow-y-auto border-r border-gray-200 md:max-w-96">
          <ol className="divide-y divide-gray-100 border-b border-gray-100">
            {posts.map((postFileName) => {
              const slug = postFileName
                .replace(".jsx", "")
                .replace(".tsx", "")
                .replace("blog.", "");
              const [day, ...blogTitle] = slug.split("-");
              const link = `/blog/${slug}`;
              return (
                <li
                  key={postFileName}
                  className="relative flex max-w-prose items-center justify-between gap-x-6 overflow-hidden bg-white px-4 py-5"
                >
                  <div className="flex grow flex-col items-start justify-around">
                    <Link to={link}>
                      {blogTitle
                        .map((string) => {
                          return string.replace("_", "'");
                        })
                        .map((string) => {
                          return (
                            string.charAt(0).toUpperCase() + string.slice(1)
                          );
                        })

                        .join(" ")}
                    </Link>
                    <p className="ml-auto text-xs text-gray-400">
                      {new Date(
                        day.slice(0, 4),
                        day.slice(4, 6) - 1,
                        day.slice(6),
                      ).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Link className="flex shrink-0 items-center" to={link}>
                    <ChevronRightIcon
                      className="h-5 w-5 flex-none text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default Blog;
