/* filters */
export const criterias: any = {
  buttery: null,
  brioche_or_flaky: null,
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
