export interface ChocolatineCriterias {
  buttery?: number;
  flaky_or_brioche?: number;
  golden_or_pale?: number;
  crispy_or_soft?: number;
  light_or_dense?: number;
  chocolate_disposition?: number;
  big_or_small?: number;
  good_or_not_good?: number;
}

export interface ChocolatineAverageCriterias {
  average_buttery?: number;
  average_flaky_or_brioche?: number;
  average_golden_or_pale?: number;
  average_crispy_or_soft?: number;
  average_light_or_dense?: number;
  average_chocolate_disposition?: number;
  average_big_or_small?: number;
  average_good_or_not_good?: number;
}

export interface ChocolatineFiltersInterface {
  average_buttery?: Array<string>;
  average_flaky_or_brioche?: Array<string>;
  average_golden_or_pale?: Array<string>;
  average_crispy_or_soft?: Array<string>;
  average_light_or_dense?: Array<string>;
  average_chocolate_disposition?: Array<string>;
  average_big_or_small?: Array<string>;
  average_good_or_not_good?: Array<string>;
  opened_now?: Array<string>;
  homemade?: Array<string>;
  price?: Array<string>;
  [index: string]: Array<string> | undefined;
}
