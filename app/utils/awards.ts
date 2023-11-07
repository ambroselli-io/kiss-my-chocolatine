import type { AvailableAward, Positions } from "@prisma/client";

export const awards: Record<AvailableAward, string> = {
  MASTER_PAIN_AU_CHOCOLAT: "Master du Pain au Chocolat",
};

export const positions: Record<Positions, string> = {
  WINNER: "🥇 Vainqueur",
  SECOND: "🥈 Second",
  THIRD: "🥉 Third",
  FINALIST: "Finalist",
};
