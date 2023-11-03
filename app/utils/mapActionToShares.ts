import type { Action, UserAction } from "@prisma/client";

export const mapActionToShares: Record<Action, number> = {
  USER_REGISTRATION: 100,
  USER_SHOP_NEW: 10,
  USER_SHOP_UPDATE: 5,
  USER_REFERRAL_CREATER: 100,
  USER_REFERRAL_RECEIVER: 1,
  USER_CHOCOLATINE_CRITERIAS_REVIEW: 100,
  USER_CHOCOLATINE_COMMENT_SCORE: 50,
  USER_LINKEDIN_LIKE: 10,
  USER_LINKEDIN_COMMENT: 20,
  USER_LINKEDIN_SHARE: 30,
  USER_LINKEDIN_POST: 50,
  USER_LINKEDIN_FOLLOW_PAGE: 5,
  INVESTOR_EURO_AMOUNT: 1,
  BUILDER_HOUR_AMOUNT: 1,
  FEEDBACK: 50,
};

export const reduceAllDBActionsToShares = (
  userActions: Array<UserAction>,
  actions: Array<Action>,
) => {
  const uaObject = userActions
    .filter((ua) => actions.includes(ua.action))
    .reduce((builders: any, ua) => {
      const email = ua.user_email as string;
      if (!builders[email]) {
        builders[email] = 0;
      }
      builders[email] =
        builders[email] + ua.number_of_actions * mapActionToShares[ua.action];
      return builders;
    }, {});

  const allStakeholders = Object.keys(uaObject).map((user_email) => {
    return {
      user_email,
      number_of_actions: uaObject[user_email],
    };
  });
  const totalStakeholdersActions = allStakeholders.reduce((total, builder) => {
    return total + builder.number_of_actions;
  }, 0);

  return [allStakeholders, totalStakeholdersActions];
};
