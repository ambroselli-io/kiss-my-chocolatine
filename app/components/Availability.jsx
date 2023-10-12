import ReactDOM from "react-dom";
import { useEffect, useMemo, useState } from "react";

const Availability = ({
  shop,
  title = "Opening hours",
  openedCaption = "Opened now",
  closedCaption = "Closed now",
}) => {
  const [showMoreAvailability, setShowMoreAvailability] = useState(false);
  const hoursPerDay = useMemo(() => {
    const days = {
      Monday: { opens: null, closes: null },
      Tuesday: { opens: null, closes: null },
      Wednesday: { opens: null, closes: null },
      Thursday: { opens: null, closes: null },
      Friday: { opens: null, closes: null },
      Saturday: { opens: null, closes: null },
      Sunday: { opens: null, closes: null },
    };
    for (const spec of shop.openingHoursSpecification) {
      // {
      //   "@type": "OpeningHoursSpecification",
      //   "dayOfWeek": ["Saturday"],
      //   "opens": "09:00",
      //   "closes": "16:00"
      // }
      console.log(spec);
      for (const dayOfWeek of spec.dayOfWeek) {
        days[dayOfWeek].opens = spec.opens;
        days[dayOfWeek].closes = spec.closes;
      }
    }
    return days;
  }, [shop]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const now = Date.now();
  const hoursToday = hoursPerDay[today];
  const isOpenedNow = useMemo(() => {
    if (!hoursToday.opens) return false;
    // opens is something like 19:00
    const opens = (() => {
      const [hours, minutes] = hoursToday.opens.split(":");
      return new Date().setHours(hours, minutes);
    })();
    const closes = (() => {
      const [hours, minutes] = hoursToday.closes.split(":");
      return new Date().setHours(hours, minutes);
    })();
    return now >= opens && now <= closes;
  }, [hoursToday]);

  return (
    <>
      <MoreAvailability
        hoursPerDay={hoursPerDay}
        title={title}
        isOpenedNow={isOpenedNow}
        today={today}
        show={showMoreAvailability}
        close={() => setShowMoreAvailability(false)}
      />
      <div className="flex cursor-pointer" onClick={() => setShowMoreAvailability(true)}>
        <em className={`not-italic ${!isOpenedNow && "text-red-500"}`}>
          {isOpenedNow ? openedCaption : closedCaption}
        </em>
        <em className="text-gray-400">
          {!!hoursToday.opens && `\u00A0\u00A0${hoursToday.opens} - ${hoursToday.closes}`}
        </em>
      </div>
    </>
  );
};

const MoreAvailability = ({ hoursPerDay, today, isOpenedNow, title, show, close }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);
  if (!isMounted) return null;

  return ReactDOM.createPortal(
    <aside
      className={`absolute h-full w-full bg-white flex flex-col overflow-y-hidden ${
        !show ? "translate-y-full" : ""
      } transition-transform delay-150 duration-500`}>
      <div className="w-full h-full relative overflow-y-auto px-4 py-6">
        <button className="font-light text-black absolute right-2 top-2" onClick={close}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
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
        <h2 className="font-bold mb-3">{title}</h2>
        <div className="flex text-sm">
          <div className="flex flex-col mr-2">
            {Object.keys(hoursPerDay).map((weekday) => (
              <span
                key={weekday}
                className={`block ml-2 mb-1 ${today === weekday ? "font-bold" : ""} `}>
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
                  className={`block ml-2 mb-1 ${today === weekday ? "font-bold" : ""} `}>
                  {opens} - {closes}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </aside>,
    document?.getElementById("drawer")
  );
};

export default Availability;
