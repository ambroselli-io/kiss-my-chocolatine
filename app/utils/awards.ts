import type { AvailableAward, Positions } from "@prisma/client";

export const readableAwards: Record<AvailableAward, string> = {
  MEILLEURE_BOULANGERIE_DE_FRANCE_M6: "Meilleure Boulangerie de France M6",
  MASTER_PAIN_AU_CHOCOLAT: "Master du Pain au Chocolat",
};

export const readablePositions: Record<Positions, string> = {
  WINNER: "🥇 Winner",
  SECOND: "🥈 Second",
  THIRD: "🥉 Third",
  FINALIST: "💪 Finalist",
};
