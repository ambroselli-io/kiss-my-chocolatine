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
        case 1:
          return "Pas beurré";
        case 2:
          return "Peu beurré";
        default:
        case 3:
          return "Bien beurré";
        case 4:
          return "Bien beurré";
        case 5:
          return "QUE du beurre";
      }
    }
    default:
      return dotData.index;
    case "Feuilleté":
      switch (dotData.value) {
        case 1:
          return "Pas feuilleté";
        case 2:
          return "Peu feuilleté";
        default:
        case 3:
          return "Bien feuilleté";
        case 4:
          return "Vraiment feuilleté";
        case 5:
          return "Très feuilleté";
      }
    case "Doré":
      switch (dotData.value) {
        case 1:
          return "Très pâle";
        case 2:
          return "Pâle";
        default:
        case 3:
          return "Juste doré";
        case 4:
          return "Bien doré";
        case 5:
          return "Très doré";
      }
    case "Croustillant":
      switch (dotData.value) {
        case 1:
          return "Très mou";
        case 2:
          return "Mou";
        default:
        case 3:
          return "Juste croustillant";
        case 4:
          return "Bien croustillant";
        case 5:
          return "Très croustillant";
      }
    case "Léger":
      switch (dotData.value) {
        case 1:
          return "Très aéré";
        case 2:
          return "Bien aéré";
        default:
        case 3:
          return "Dense ⚖️ aéré";
        case 4:
          return "Bien dense";
        case 5:
          return "Très dense";
      }
    case `Disposition chocolat`:
      switch (dotData.value) {
        case 1:
          return "Superposé";
        case 2:
          return "Collé";
        default:
        case 3:
          return "Bien disposé";
        case 4:
          return "Un peu écarté";
        case 5:
          return "Sur les bords";
      }
    case "Gros ?":
      switch (dotData.value) {
        case 1:
          return "Très petit";
        case 2:
          return "Petit";
        default:
        case 3:
          return "Taille normale";
        case 4:
          return "Gros";
        case 5:
          return "Très gros";
      }
  }
};

export const fromShopToRadarData = (shop: Shop): RadarData => {
  return [
    {
      index: "Beurré",
      value: Math.max(shop.chocolatine_average_buttery + 3, 1),
    },
    {
      index: "Feuilleté",
      value: -Math.min(shop.chocolatine_average_flaky_or_brioche - 3, -1),
    },
    {
      index: "Doré",
      value: -Math.min(shop.chocolatine_average_golden_or_pale - 3, -1),
    },
    {
      index: "Gros ?",
      value: Math.max(shop.chocolatine_average_big_or_small + 3, 1),
    },
    // {
    //   index: `Disposition chocolat`,
    //   value: Math.max(shop.chocolatine_average_chocolate_disposition + 3, 1),
    // },
    {
      index: "Croustillant",
      value: -Math.min(shop.chocolatine_average_crispy_or_soft - 3, -1),
    },
    {
      index: "Léger",
      value: Math.max(shop.chocolatine_average_light_or_dense + 3, 1),
    },
  ];
};
