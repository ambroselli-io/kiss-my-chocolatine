import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "@remix-run/react";
import useChocolatineName from "~/utils/useChocolatineName";

export default function SwitchProduct() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const expanded = searchParams.get("switch-env") === "true";
  const navigate = useNavigate();
  const { chocolatinesName } = useChocolatineName();

  const onClick = (e) => {
    if (!expanded) {
      searchParams.set("switch-env", "true");
      setSearchParams(searchParams);
      return;
    }
    const { environment } = e.currentTarget.dataset;
    searchParams.delete("switch-env", "true");
    const url = window.location.href.replace(window.location.origin, "");
    const newUrl = url.replace(params.product, environment);
    navigate(newUrl);
  };

  return (
    <>
      <div
        className={[
          "pointer-events-none absolute inset-0 grid transition-all duration-500",
          expanded ? "buttons-expanded z-50 bg-black/70 backdrop-blur-xl" : "buttons-folded",
        ].join(" ")}
      >
        <div className="relative col-start-2 row-start-2 self-center justify-self-center">
          <button
            type="button"
            onClick={onClick}
            data-environment="chocolatine"
            className="pointer-events-auto z-50 flex flex-col items-center transition-all"
          >
            <div
              className={[
                "overflow-hidden rounded-full border",
                expanded ? "h-28 w-28 border-2 delay-100" : "h-0 w-0 delay-100",
                params.product === "chocolatine" && expanded && "border-app-500",
                params.product === "chocolatine" && !expanded && "mb-4 ml-4 !h-20 !w-20",
              ].join(" ")}
            >
              <img
                src="/assets/chocolatine-blurred.jpg"
                className="h-full w-full -translate-y-4 scale-150 object-cover"
                alt="pain au chocolatine"
              />
            </div>
            <p
              className={[
                "absolute -bottom-10 -left-10 -right-10 m-0 text-center capitalize transition-all",
                expanded ? "text-white opacity-100 delay-500" : "opacity-0",
              ].join(" ")}
            >
              {chocolatinesName}
            </p>
          </button>
        </div>
        <div className="relative col-start-3 row-start-2 self-center justify-self-center">
          <button
            type="button"
            onClick={onClick}
            data-environment="croissant"
            className="pointer-events-auto z-50 flex flex-col items-center transition-all"
          >
            <div
              className={[
                "overflow-hidden rounded-full border",
                expanded ? "h-28 w-28 border-2 delay-100" : "h-0 w-0 delay-100",
                params.product === "croissant" && expanded && "border-app-500",
                params.product === "croissant" && !expanded && "mb-4 ml-4 !h-20 !w-20",
              ].join(" ")}
            >
              <img
                src="/assets/croissant-blurred.webp"
                className="h-full w-full -translate-y-4 scale-150 object-cover"
                alt="pain au chocolatine"
              />
            </div>
            <p
              className={[
                "absolute -bottom-10 -left-10 -right-10 m-0 text-center capitalize transition-all",
                expanded ? "text-white opacity-100 delay-500" : "opacity-0",
              ].join(" ")}
            >
              Croissants
            </p>
          </button>
        </div>
        <div className="relative col-start-2 row-start-3 self-center justify-self-center">
          <button
            type="button"
            onClick={onClick}
            data-environment="galette"
            className="pointer-events-auto z-50 flex flex-col items-center transition-all"
          >
            <div
              className={[
                "overflow-hidden rounded-full border",
                expanded ? "h-28 w-28 border-2 delay-100" : "h-0 w-0 delay-100",
                params.product === "galette" && expanded && "border-app-500",
                params.product === "galette" && !expanded && "mb-4 ml-4 !h-20 !w-20",
              ].join(" ")}
            >
              <img
                src="/assets/galette-blurred.webp"
                className="h-full w-full -translate-y-4 scale-150 object-cover"
                alt="pain au chocolatine"
              />
            </div>
            <p
              className={[
                "absolute -bottom-10 -left-10 -right-10 m-0 text-center capitalize transition-all",
                expanded ? "text-white opacity-100 delay-500" : "opacity-0",
              ].join(" ")}
            >
              Galettes des Rois
            </p>
          </button>
        </div>
        <div className="relative col-start-3 row-start-3 self-center justify-self-center">
          <button
            type="button"
            onClick={onClick}
            data-environment="baguette"
            className="pointer-events-auto z-50 flex flex-col items-center transition-all"
          >
            <div
              className={[
                "overflow-hidden rounded-full border",
                expanded ? "h-28 w-28 border-2 delay-100" : "h-0 w-0 delay-100",
                params.product === "baguette" && expanded && "border-app-500",
                params.product === "baguette" && !expanded && "mb-4 ml-4 !h-20 !w-20",
              ].join(" ")}
            >
              <img
                src="/assets/baguette-blurred.webp"
                className="h-full w-full -translate-y-4 scale-150 object-cover"
                alt="pain au chocolatine"
              />
            </div>
            <p
              className={[
                "absolute -bottom-10 -left-10 -right-10 m-0 text-center capitalize transition-all",
                expanded ? "text-white opacity-100 delay-500" : "opacity-0",
              ].join(" ")}
            >
              Baguette
            </p>
          </button>
        </div>
      </div>
    </>
  );
}
