type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface OpeningHoursSpecification {
  "@type": string;
  dayOfWeek: Array<Day>;
  opens: string;
  closes: string;
}

interface GeoCoordinates {
  "@type": string;
  latitude: number;
  longitude: number;
}

interface PostalAddress {
  "@type": string;
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: string;
}

interface AggregateRating {
  "@type": string;
  ratingValue: string;
  reviewCount: number;
}

export interface SchemaOrgShop {
  "@context": string;
  "@type": string;
  name: string;
  identifier: string;
  address: PostalAddress;
  telephone: string;
  url: string;
  geo: GeoCoordinates;
  openingHoursSpecification: Array<OpeningHoursSpecification>;
  servesCuisine: string;
  priceRange: string;
  paymentAccepted: Array<string>;
  additionalType: Array<string>;
  aggregateRating: AggregateRating;
}
