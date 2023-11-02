import type { ChocolatineReview } from "@prisma/client";
import type {
  ChocolatineAverageCriterias,
  ChocolatineCriterias,
} from "~/types/chocolatineCriterias";
/* filters */

export const criterias = [
  "buttery",
  "flaky_or_brioche",
  "golden_or_pale",
  "crispy_or_soft",
  "light_or_dense",
  "chocolate_disposition",
  "big_or_small",
  "good_or_not_good",
];

export function compileReviews(
  reviews: Array<ChocolatineReview>,
): ChocolatineAverageCriterias {
  const quality: ChocolatineCriterias = {};
  const numberOfReviews: ChocolatineCriterias = {};
  for (const review of reviews ?? []) {
    for (let reviewField of Object.keys(review)) {
      if (!criterias.includes(reviewField)) continue;
      const chocolatineQualityCriteria =
        reviewField as keyof ChocolatineCriterias;
      if (!review.hasOwnProperty(chocolatineQualityCriteria)) continue;
      const value = Number(review[chocolatineQualityCriteria]);
      quality[chocolatineQualityCriteria] =
        (quality[chocolatineQualityCriteria] || 0) + Number(value);
      numberOfReviews[chocolatineQualityCriteria] =
        (numberOfReviews[chocolatineQualityCriteria] || 0) + 1;
    }
  }
  return {
    average_buttery:
      typeof numberOfReviews?.buttery === "number" &&
      typeof quality.buttery === "number"
        ? quality.buttery / numberOfReviews.buttery
        : undefined,
    average_flaky_or_brioche:
      typeof numberOfReviews?.flaky_or_brioche === "number" &&
      typeof quality.flaky_or_brioche === "number"
        ? quality.flaky_or_brioche / numberOfReviews.flaky_or_brioche
        : undefined,
    average_golden_or_pale:
      typeof numberOfReviews?.golden_or_pale === "number" &&
      typeof quality.golden_or_pale === "number"
        ? quality.golden_or_pale / numberOfReviews.golden_or_pale
        : undefined,
    average_crispy_or_soft:
      typeof numberOfReviews?.crispy_or_soft === "number" &&
      typeof quality.crispy_or_soft === "number"
        ? quality.crispy_or_soft / numberOfReviews.crispy_or_soft
        : undefined,
    average_light_or_dense:
      typeof numberOfReviews?.light_or_dense === "number" &&
      typeof quality.light_or_dense === "number"
        ? quality.light_or_dense / numberOfReviews.light_or_dense
        : undefined,
    average_chocolate_disposition:
      typeof numberOfReviews?.chocolate_disposition === "number" &&
      typeof quality.chocolate_disposition === "number"
        ? quality.chocolate_disposition / numberOfReviews?.chocolate_disposition
        : undefined,
    average_big_or_small:
      typeof numberOfReviews?.big_or_small === "number" &&
      typeof quality.big_or_small === "number"
        ? quality.big_or_small / numberOfReviews?.big_or_small
        : undefined,
    average_good_or_not_good:
      typeof numberOfReviews?.good_or_not_good === "number" &&
      typeof quality.good_or_not_good === "number"
        ? quality.good_or_not_good / numberOfReviews?.good_or_not_good
        : undefined,
  };
}

export function from020to22(oldRating?: number): number {
  if (!oldRating) return 0;
  // from 0 to 20 mark to -2 to 2
  const oldMax = 20;
  const oldMin = 0;
  const newMax = 2;
  const newMin = -2;
  return (
    ((oldRating - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin
  );
}
