import { useSearchParams } from "@remix-run/react";
import React from "react";

// inspiration: https://codepen.io/rylanharper/pen/MoqBeG
const ButtonArrowMenu = ({ isActive, onClick }) => {
  const [searchParams] = useSearchParams();
  const searchParamsSize = Array.from(searchParams).length;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      type="button"
      className="flex h-10 w-10 shrink-0 items-center justify-center p-2.5"
    >
      <div className="relative flex flex-1 items-center justify-center transition-all">
        <div
          className={[
            "absolute h-0.5 w-full bg-black transition-all will-change-transform",
            isActive ? "translate-y-0 -rotate-45" : "translate-y-1",
          ].join(" ")}
        />
        <div
          className={[
            "absolute h-0.5 w-full bg-black transition-all will-change-transform",
            isActive ? "translate-y-0 rotate-45" : "-translate-y-1",
          ].join(" ")}
        />
      </div>
      {!isActive && searchParamsSize > 0 && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border">
          {searchParamsSize}
        </div>
      )}
    </button>
  );
};

export default ButtonArrowMenu;
