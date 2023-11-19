import type { Shop } from "@prisma/client";
import type { OpeningHoursSpecification } from "~/types/schemaOrgShop";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type HoursForOneDay = { opens: string | null; closes: string | null };
type HoursPerDay = Record<Day, HoursForOneDay>;

function hasNoHoursYes(hours: HoursPerDay) {
  return Object.values(hours).every((h) => h.opens === null);
}

export function isOpenedNow(shop: Shop): {
  isOpened: boolean;
  hasNoHours: boolean;
  hoursPerDay: HoursPerDay;
  hoursToday: HoursForOneDay;
} {
  const hoursPerDay: HoursPerDay = {
    Monday: {
      opens: shop.opening_hours_monday_open,
      closes: shop.opening_hours_monday_close,
    },
    Tuesday: {
      opens: shop.opening_hours_tuesday_open,
      closes: shop.opening_hours_tuesday_close,
    },
    Wednesday: {
      opens: shop.opening_hours_wednesday_open,
      closes: shop.opening_hours_wednesday_close,
    },
    Thursday: {
      opens: shop.opening_hours_thursday_open,
      closes: shop.opening_hours_thursday_close,
    },
    Friday: {
      opens: shop.opening_hours_friday_open,
      closes: shop.opening_hours_friday_close,
    },
    Saturday: {
      opens: shop.opening_hours_saturday_open,
      closes: shop.opening_hours_saturday_close,
    },
    Sunday: {
      opens: shop.opening_hours_sunday_open,
      closes: shop.opening_hours_sunday_close,
    },
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  }) as Day;
  const now = Date.now();
  const hoursToday = hoursPerDay[today] ?? { opens: null, closes: null };
  const isOpened = (() => {
    if (!hoursToday.opens) return false;
    if (!hoursToday.closes) return false;
    // opens is something like 19:00
    const opens = (() => {
      const [hours, minutes] = hoursToday.opens.split(":").map(Number);
      return new Date().setHours(hours, minutes);
    })();
    const closes = (() => {
      const [hours, minutes] = hoursToday.closes.split(":").map(Number);
      return new Date().setHours(hours, minutes);
    })();
    return now >= opens && now <= closes;
  })();
  return {
    isOpened,
    hoursPerDay,
    hoursToday,
    hasNoHours: hasNoHoursYes(hoursPerDay),
  };
}
