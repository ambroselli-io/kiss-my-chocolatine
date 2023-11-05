import React from "react";

export default function BlogEmphasize({ children }) {
  return (
    <p className="relative -rotate-[0.5deg]">
      <span
        aria-hidden="true"
        className="relative ml-1 inline border-b-4 border-b-app-300 text-lg font-bold not-italic text-transparent"
      >
        {children}
      </span>
      <em className="absolute left-2 top-0.5 rotate-[0.5deg] text-lg font-bold not-italic">
        {children}
      </em>
    </p>
  );
}
