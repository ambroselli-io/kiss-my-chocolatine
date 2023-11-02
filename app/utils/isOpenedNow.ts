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

export function isOpenedNow(
  shop: Shop,
): [boolean, HoursPerDay, HoursForOneDay] {
  const hoursPerDay: HoursPerDay = (() => {
    const days: HoursPerDay = {
      Monday: { opens: null, closes: null },
      Tuesday: { opens: null, closes: null },
      Wednesday: { opens: null, closes: null },
      Thursday: { opens: null, closes: null },
      Friday: { opens: null, closes: null },
      Saturday: { opens: null, closes: null },
      Sunday: { opens: null, closes: null },
    };
    if (!shop.openingHoursSpecification) return days;
    const openingHoursSpecifications =
      shop.openingHoursSpecification as unknown as Array<OpeningHoursSpecification>;
    for (const spec of openingHoursSpecifications) {
      // {
      //   "dayOfWeek": ["Saturday"],
      //   "opens": "09:00",
      //   "closes": "16:00"
      // }
      for (const dayOfWeek of spec.dayOfWeek) {
        days[dayOfWeek].opens = spec.opens;
        days[dayOfWeek].closes = spec.closes;
      }
    }
    return days;
  })();

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
  return [isOpened, hoursPerDay, hoursToday];
}
