import type { Shop } from "../types/shop";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type HoursPerDay = Record<Day, { opens: string | null; closes: string | null }>;

export function isOpenedNow(shop: Shop) {
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
    for (const spec of shop.openingHoursSpecification) {
      // {
      //   "@type": "OpeningHoursSpecification",
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
  const hoursToday = hoursPerDay[today];
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
