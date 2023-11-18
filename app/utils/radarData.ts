import type { Shop } from "@prisma/client";

type criteria =
  | "Beurré"
  | "Feuilleté"
  | "Doré"
  | "Croustillant"
  | "Léger"
  | `Disposition chocolat`
  | "Gros ?";

type DotData = {
  index: criteria;
  value: number;
};

export type RadarData = Array<DotData>;

export const renderDotLabel = (dotData: any): string => {
  dotData = dotData as DotData;
  console.log(dotData);
  switch (dotData.index) {
    case "Beurré": {
      switch (dotData.value) {
        case 0.1:
          return "Pas beurré";
        case 1:
          return "Peu beurré";
        default:
        case 2:
          return "Beurré";
        case 3:
          return "Bien beurré";
        case 4:
          return "QUE du beurre";
      }
    }
    default:
      return dotData.index;
    case "Feuilleté":
      switch (dotData.value) {
        case 0.1:
          return "Pas feuilleté";
        case 1:
          return "Peu feuilleté";
        default:
        case 2:
          return "Bien feuilleté";
        case 3:
          return "Vraiment feuilleté";
        case 4:
          return "Très feuilleté";
      }
    case "Doré":
      switch (dotData.value) {
        case 0.1:
          return "Très pâle";
        case 1:
          return "Peu doré";
        default:
        case 2:
          return "Doré";
        case 3:
          return "Bien doré";
        case 4:
          return "Très doré";
      }
    case "Croustillant":
      switch (dotData.value) {
        case 0.1:
          return "Très mou";
        case 1:
          return "Mou";
        default:
        case 2:
          return "Croustillant";
        case 3:
          return "Bien croustillant";
        case 4:
          return "Très croustillant";
      }
    case "Léger":
      switch (dotData.value) {
        case 0.1:
          return "Très dense";
        case 1:
          return "Dense";
        default:
        case 2:
          return "Léger";
        case 3:
          return "Bien léger";
        case 4:
          return "Très léger";
      }
    case `Disposition chocolat`:
      switch (dotData.value) {
        case 0.1:
          return "Superposé";
        case 1:
          return "Collé";
        default:
        case 2:
          return "Bien disposé";
        case 3:
          return "Un peu écarté";
        case 4:
          return "Sur les bords";
      }
    case "Gros ?":
      switch (dotData.value) {
        case 0.1:
          return "Très petit";
        case 1:
          return "Petit";
        default:
        case 2:
          return "Normal";
        case 3:
          return "Gros";
        case 4:
          return "Très gros";
      }
  }
};

export const fromShopToRadarData = (shop: Shop): RadarData => {
  return [
    {
      index: "Beurré",
      value: Math.max(shop.chocolatine_average_buttery + 2, 0.1),
    },
    {
      index: "Feuilleté",
      value: Math.max(shop.chocolatine_average_flaky_or_brioche + 2, 0.1),
    },
    {
      index: "Doré",
      value: Math.max(shop.chocolatine_average_golden_or_pale + 2, 0.1),
    },
    {
      index: "Gros ?",
      value: Math.max(shop.chocolatine_average_big_or_small + 2, 0.1),
    },
    // {
    //   index: `Disposition chocolat`,
    //   value: Math.max(shop.chocolatine_average_chocolate_disposition + 2, 0.1),
    // },
    {
      index: "Croustillant",
      value: Math.max(shop.chocolatine_average_crispy_or_soft + 2, 0.1),
    },
    {
      index: "Léger",
      value: Math.max(shop.chocolatine_average_light_or_dense + 2, 0.1),
    },
  ];
};
