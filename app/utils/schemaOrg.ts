import type {
  SchemaOrgShop,
  OpeningHoursSpecification,
} from "~/types/schemaOrgShop";
import type { SchemaOrgChocolatine } from "~/types/schemaOrgChocolatine";
import type { Shop, Chocolatine, ChocolatineReview } from "@prisma/client";

export function shopFromRowToSchemaOrg(shop: Shop): SchemaOrgShop {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: shop.name,
    identifier: shop.id.toString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.streetAddress ?? "",
      postalCode: shop.addresspostalCode ?? "",
      addressLocality: shop.addressLocality,
      addressCountry: shop.addressCountry ?? "",
    },
    telephone: shop.telephone ?? "",
    url: shop.url ?? "",
    geo: {
      "@type": "GeoCoordinates",
      latitude: shop.latitude as number,
      longitude: shop.longitude as number,
    },
    openingHoursSpecification:
      shop.openingHoursSpecification as unknown as Array<OpeningHoursSpecification>,
  };
}

export function chocolatineFromRowToSchemaOrg(
  chocolatine?: Chocolatine,
  chocolatineReviews: Array<ChocolatineReview> = [],
): SchemaOrgChocolatine | null {
  if (!chocolatine?.id) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    identifier: chocolatine.id,
    name: "Pain au chocolat",
    belongsTo: {
      "@type": "Bakery",
      identifier: chocolatine.shop_id,
    },
    offers: {
      "@type": "Offer",
      price: String(chocolatine.price) ?? null,
      priceCurrency: "EUR",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Homemade",
        possibleValues: [
          "I don't know, nobody tried yet",
          "I think so",
          "I don't think so",
          "Yes",
          "No",
        ],
        value: chocolatine.homemade,
      },
    ],
    additionalType: [
      {
        "@type": "PropertyValue",
        name: "Ingredients",
        value: [],
      },
    ],
    reviews: chocolatineReviews.map((review) => ({
      "@context": "https://schema.org",
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.user_username,
      },
      datePublished: review.created_at.toISOString().split("T")[0],
      reviewBody: review.comment ?? "",
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "light_or_dense",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 is for very light, -1 for light, 0 for medium, 1 for dense, 2 for very dense",
          value: review.light_or_dense,
        },
        {
          "@type": "PropertyValue",
          name: "flaky_or_brioche",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 is for very brioche, -1 for brioche, 0 for medium, 1 for flaky, 2 for very flaky",
          value: review.flaky_or_brioche,
        },
        {
          "@type": "PropertyValue",
          name: "buttery",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 is for not buttery at all, -1 for not buttery, 0 for medium, 1 for buttery, 2 for very buttery",
          value: review.buttery,
        },
        {
          "@type": "PropertyValue",
          name: "golden_or_pale",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 is for very golden, -1 for golden, 0 for medium, 1 for pale, 2 for very pale",
          value: review.golden_or_pale,
        },
        {
          "@type": "PropertyValue",
          name: "crispy_or_soft",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 is for very crispy, -1 for crispy, 0 for medium, 1 for soft, 2 for very soft",
          value: review.crispy_or_soft,
        },
        {
          "@type": "PropertyValue",
          name: "big_or_small",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 for very small, -1 for small, 0 for medium, 1 for big, 2 for very big",
          value: review.big_or_small,
        },
        {
          "@type": "PropertyValue",
          name: "chocolate_disposition",
          minValue: -2,
          maxValue: 2,
          valueReference:
            "-2 for superimposed, -1 for stuck side by side, 0 for well distributed, 1 for too far away, 2 for on the edges",
          value: review.chocolate_disposition,
        },
        {
          "@type": "PropertyValue",
          name: "good_or_not_good",
          minValue: 0,
          maxValue: 20,
          valueReference: "subjective, score from 0 to 20",
          value: review.good_or_not_good,
        },
      ],
    })),
  };
}