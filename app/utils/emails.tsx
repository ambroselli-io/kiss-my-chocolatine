import Cookies from "js-cookie";

export function createMailtoHref(mail: string, subject: string, body: string) {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body)
    .replace(/%20/g, " ")
    .replace(/\n/g, "%0A");

  return `mailto:${mail}?subject=${encodedSubject}&body=${encodedBody}`;
}

export function newShopEmail(email: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
    email,
    "New Bakery",
    `Hello, and thanks for your interest!

For the bakery, we're interested in the google map link because it got all the adresse-email-phone-opening hours-coordinates we need.
Please paste it here below:


For the ${chocolatineName}, You can fill any of these fields, with a note from 0 to 5
-Softness/Moelleux:
-Flakiness/Feuilletage:
-Crispiness/Croustillant:
-Fondant:
-Chocolate quality:
-Chocolate disposition:
-Note:
-Visual aspect:

If you know the ingredients, you can add them here too

Thanks!
Arnaud, from Kiss My Chocolatine
`,
  );
}

export function newIngredient(email: string, shopName?: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
    email,
    `Ingredient's list for ${shopName}'s ${chocolatineName}`,
    `Hello, and thanks for your interest!

If you know or want to modifiy the ingredients, you can do it here:
For each ingredient, please fill up (if you know/want)
-name:
-quantity, with the unit (like 200g or 3 pincées):
-supplier:
-origin (country/city):
Please, don't lie about them to oversell the product if you have any interest in this action, tell the truth. We'll double check anyway, at some point.

If we are missing any information about the bakery, please tell us here too:

Thanks!
Arnaud, from Kiss My Chocolatine
`,
  );
}

export function newReview(email: string, shopName?: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
    email,
    `New Review for ${shopName}'s ${chocolatineName}`,
    `Hello, and thanks for your interest!


For the ${chocolatineName}, You can fill any of these fields, with a note from 0 to 5


If you know the ingredients, you can add them here too:
For each ingredient, please fill up (if you know/want)
-name:
-quantity, with the unit (like 200g or 3 pincées):
-supplier:
-origin (country/city):
Please, don't lie about them to oversell the product if you have any interest in this action, tell the truth. We'll double check anyway, at some point.

If we are missing any information about the bakery, please tell us here too:

Thanks!
Arnaud, from Kiss My Chocolatine
`,
  );
}

export function newFeedback(email: string, shopName?: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
    email,
    `New Feedback for ${shopName}'s ${chocolatineName}`,
    `Hello, and thanks for your interest!

Please, tell us:



Thanks!

Arnaud, from Kiss My Chocolatine
`,
  );
}
