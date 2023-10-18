interface Person {
  "@type": string;
  name: string;
}

interface Review {
  "@context": string;
  "@type": string;
  author: Person;
  datePublished: string;
  reviewBody: string;
  additionalProperty: PropertyValue[];
}

interface PropertyValue {
  "@type": string;
  name: string;
  minValue?: number;
  maxValue?: number;
  valueReference?: string;
  value: number | boolean;
}

interface BakeryReference {
  "@type": string;
  identifier: string;
}

interface Offer {
  "@type": string;
  price: string;
  priceCurrency: string;
  availability: string;
}

export interface Chocolatine {
  "@context": string;
  "@type": string;
  identifier: string;
  name: string;
  belongsTo: BakeryReference;
  offers: Offer;
  additionalProperty: PropertyValue[];
  additionalType: PropertyValue[];
  reviews: Review[];
}
