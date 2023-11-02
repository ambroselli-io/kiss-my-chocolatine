import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import { isOpenedNow } from "~/utils/isOpenedNow";
import type { Shop } from "@prisma/client";

const Availability = ({
  shop,
  title = "Opening hours",
  openedCaption = "Opened now",
  closedCaption = "Closed now",
}: {
  shop: Shop;
  title?: string;
  openedCaption?: string;
  closedCaption?: string;
}) => {
  const [showMoreAvailability, setShowMoreAvailability] = useState(false);
  const [isOpened, hoursPerDay, hoursToday] = isOpenedNow(shop);

  return (
    <>
      <MoreAvailability
        hoursPerDay={hoursPerDay}
        title={title}
        show={showMoreAvailability}
        close={() => setShowMoreAvailability(false)}
      />
      <div
        className="flex cursor-pointer"
        onClick={() => setShowMoreAvailability(true)}
      >
        <em className={`not-italic ${!isOpened && "text-red-500"}`}>
          {isOpened ? openedCaption : closedCaption}
        </em>
        <em className="text-gray-400">
          {!!hoursToday.opens &&
            `\u00A0\u00A0${hoursToday.opens} - ${hoursToday.closes}`}
        </em>
      </div>
    </>
  );
};

const MoreAvailability = ({ hoursPerDay, title, show, close }: any) => {
  const [isMounted, setIsMounted] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);
  if (!isMounted) return null;

  return ReactDOM.createPortal(
    <aside
      className={`absolute flex h-full w-full flex-col overflow-y-hidden bg-white ${
        !show ? "translate-y-full" : ""
      } transition-transform delay-150 duration-500`}
    >
      <div className="relative h-full w-full overflow-y-auto px-4 py-6">
        <button
          className="absolute right-2 top-2 font-light text-black"
          onClick={close}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              className="drop-shadow-sm"
              // style={{ filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1))" }}
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="mb-3 font-bold">{title}</h2>
        <div className="flex text-sm">
          <div className="mr-2 flex flex-col">
            {Object.keys(hoursPerDay).map((weekday) => (
              <span
                key={weekday}
                className={`mb-1 ml-2 block ${
                  today === weekday ? "font-bold" : ""
                } `}
              >
                {weekday}
              </span>
            ))}
          </div>
          <div className="flex flex-col">
            {Object.keys(hoursPerDay).map((weekday) => {
              const { opens, closes } = hoursPerDay[weekday];
              return (
                <span
                  key={weekday}
                  className={`mb-1 ml-2 block ${
                    today === weekday ? "font-bold" : ""
                  } `}
                >
                  {opens} - {closes}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </aside>,
    document?.getElementById("drawer") as HTMLElement,
  );
};

export default Availability;
