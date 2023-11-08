import type { AvailableAward, Positions } from "@prisma/client";

export const readableAwards: Record<AvailableAward, string> = {
  MASTER_PAIN_AU_CHOCOLAT: "Master du Pain au Chocolat",
  MEILLEUR_CROISSANT_DE_FRANCE: "Meilleur Croissant de France",
  MEILLEURE_BOULANGERIE_DE_FRANCE_M6: "Meilleure Boulangerie de France M6",
};

export const readablePositions: Record<Positions, string> = {
  WINNER: "🥇 Vainqueur",
  SECOND: "🥈 Second",
  THIRD: "🥉 Troisième",
  FINALIST: "💪 Finaliste",
};
