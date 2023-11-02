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
  possibleValues?: Array<string>;
  value: number | string | boolean | Ingredient[]; // Update to include possibility of Ingredient array
}

interface Ingredient {
  "@type": string;
  name: string;
  additionalProperty: IngredientProperty[];
}

interface IngredientProperty {
  "@type": string;
  name: string;
  value: string;
}

interface BakeryReference {
  "@type": string;
  identifier: string;
}

interface Offer {
  "@type": string;
  price: string | null;
  priceCurrency: string;
}

export interface SchemaOrgChocolatine {
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
