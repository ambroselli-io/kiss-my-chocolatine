import type { Action, UserAction } from "@prisma/client";

export const mapActionToShares: Record<Action, number> = {
  USER_REGISTRATION: 100,
  USER_SHOP_NEW: 10,
  USER_SHOP_UPDATE: 5,
  USER_REFERRAL_CREATER: 100,
  USER_REFERRAL_RECEIVER: 1,
  USER_CHOCOLATINE_CRITERIAS_REVIEW: 100,
  USER_CHOCOLATINE_COMMENT_SCORE: 50,
  USER_CHOCOLATINE_INGREDIENTS: 500,
  USER_LINKEDIN_LIKE: 10,
  USER_LINKEDIN_COMMENT: 20,
  USER_LINKEDIN_SHARE: 30,
  USER_LINKEDIN_POST: 50,
  USER_LINKEDIN_FOLLOW_PAGE: 5,
  INVESTOR_EURO_AMOUNT: 1,
  BUILDER_HOUR_AMOUNT: 1,
  FEEDBACK: 50,
};

export const mapActionToTimeSpentInSeconds: Record<Action, number> = {
  USER_REGISTRATION: 30,
  USER_SHOP_NEW: 90,
  USER_SHOP_UPDATE: 90,
  USER_REFERRAL_CREATER: 15,
  USER_REFERRAL_RECEIVER: 15,
  USER_CHOCOLATINE_CRITERIAS_REVIEW: 45,
  USER_CHOCOLATINE_COMMENT_SCORE: 30,
  USER_CHOCOLATINE_INGREDIENTS: 300,
  USER_LINKEDIN_LIKE: 5,
  USER_LINKEDIN_COMMENT: 30,
  USER_LINKEDIN_SHARE: 5,
  USER_LINKEDIN_POST: 300,
  USER_LINKEDIN_FOLLOW_PAGE: 5,
  INVESTOR_EURO_AMOUNT: 1,
  BUILDER_HOUR_AMOUNT: 60 * 60,
  FEEDBACK: 150,
};

type Stakeholder = {
  user_email: string;
  number_of_actions: number;
  time_spent: number;
};

export const reduceAllDBActionsToShares = (
  userActions: Array<UserAction>,
  actions: Array<Action>,
): [Array<Stakeholder>, number] => {
  const uaObject = userActions
    .filter((ua) => actions.includes(ua.action))
    .reduce(
      (builders: any, ua) => {
        const email = ua.user_email as string;
        if (!builders[email]) {
          builders[email] = {
            user_email: email,
            number_of_actions: 0,
            time_spent: 0,
          } as Stakeholder;
        }
        builders[email] = {
          ...builders[email],
          number_of_actions:
            builders[email].number_of_actions +
            mapActionToShares[ua.action] * ua.number_of_actions,
          time_spent:
            builders[email].time_spent +
            mapActionToTimeSpentInSeconds[ua.action] * ua.number_of_actions,
        };
        return builders;
      },
      {} as Record<string, Stakeholder>,
    );

  const allStakeholders = Object.values(uaObject) as Array<Stakeholder>;
  allStakeholders.sort((a, b): number => {
    return b.number_of_actions - a.number_of_actions;
  });

  const totalStakeholdersActions = allStakeholders.reduce((total, builder) => {
    return total + builder.number_of_actions;
  }, 0);

  return [allStakeholders, totalStakeholdersActions];
};

export function fromSecondsToHoursMinSec(seconds: number): string {
  seconds = Number(seconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  if (hours === 0 && minutes === 0) {
    return `${sec}s`;
  }
  if (hours === 0) {
    return `${minutes}m ${sec}s`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  if (sec === 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${sec}s`;
}
