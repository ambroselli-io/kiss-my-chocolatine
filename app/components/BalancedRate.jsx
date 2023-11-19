import React from "react";

export default function BalancedRate({ minCaption, maxCaption, color, value }) {
  // value is between -2 and 2
  return (
    <div className="flex max-w-sm flex-col-reverse justify-between gap-1">
      <div className="flex w-full justify-between">
        <span className="inline-flex shrink-0 grow basis-0 items-start justify-start text-left text-xs text-gray-500">
          {minCaption}
        </span>
        <span className="inline-flex shrink-0 grow basis-0 items-start justify-center text-center text-xs text-gray-500">
          ⚖️
        </span>
        <span className="inline-flex shrink-0 grow basis-0 items-start justify-end text-right text-xs text-gray-500">
          {maxCaption}
        </span>
      </div>
      <div className="relative flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="flex flex-1 justify-end">
          {value <= 0 && (
            <div
              style={{
                width: value === 0 ? "7.5%" : `${(-value / 2) * 100}%`,
                backgroundColor: color,
              }}
              className="h-full"
            />
          )}
        </div>
        <div className="flex flex-1">
          {value >= 0 && (
            <div
              style={{
                width: value === 0 ? "7.5%" : `${(value / 2) * 100}%`,
                backgroundColor: color,
              }}
              className="h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
