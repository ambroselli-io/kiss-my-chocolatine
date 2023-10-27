/* filters */
export const criterias: any = {
  buttery: null,
  flaky_or_brioche: null,
  golden_or_pale: null,
  crispy_or_soft: null,
  light_or_dense: null,
  chocolate_disposition: null,
  big_or_small: null,
  good_or_not_good: null,
};

export function compileReviews(reviews: Array<any>) {
  const quality: any = {};
  for (const review of reviews ?? []) {
    for (const criteria of review.additionalProperty) {
      if (!criterias.hasOwnProperty(criteria.name)) continue;
      if (!quality.hasOwnProperty(criteria.name)) quality[criteria.name] = 0;
      quality[criteria.name] += criteria.value;
    }
  }
  return quality;
}

export function from020to22(oldRating: number): number {
  // from 0 to 20 mark to -2 to 2
  const oldMax = 20;
  const oldMin = 0;
  const newMax = 2;
  const newMin = -2;
  return (
    ((oldRating - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin
  );
}
