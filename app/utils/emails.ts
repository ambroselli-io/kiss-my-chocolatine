import Cookies from "js-cookie";

export function createMailtoHref(subject: string, body: string) {
  const mail = window.atob("a2lzcy5teS5jaG9jb2xhdGluZUBnbWFpbC5jb20=");
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body)
    .replace(/%20/g, " ")
    .replace(/\n/g, "%0A");

  return `mailto:${mail}?subject=${encodedSubject}&body=${encodedBody}`;
}

export function newShopEmail() {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
    "New Bakery",
    `Hello, and thanks for your interest!

For the bakery, we're interested in the Google Maps link because it provides all the information we need: address, email, phone number, opening hours, and coordinates.
Please paste it here below:


For the ${chocolatineName}, you can fill any of these fields with a value from -2 to 2, based on the provided criteria.

-Light or Dense:
  (-2 is for very light, -1 for light, 0 for medium, 1 for dense, 2 for very dense)

-Flaky or Brioche:
  (-2 is for very flaky, -1 for flaky, 0 for medium, 1 for brioche, 2 for very brioche)

-Buttery:
  (-2 is for not buttery at all, -1 for not buttery, 0 for medium, 1 for buttery, 2 for very buttery)

-Golden or Pale:
  (-2 is for very golden, -1 for golden, 0 for medium, 1 for pale, 2 for very pale)

-Crispy or Soft:
  (-2 is for very crispy, -1 for crispy, 0 for medium, 1 for soft, 2 for very soft)

-Chocolate Disposition:
  (-2 for superimposed, -1 for stuck side by side, 0 for well-distributed, 1 for too far away, 2 for on the edges)

-Big or small:
  (-2 for very small, -1 for small, 0 for medium, 1 for big, 2 for very big)

-Good or Not Good:
  (-2 for very bad, 2 for very good)

If you know the ingredients, you can add them here too.

Thanks!
Arnaud, from Kiss My Chocolatine
`,
  );
}

export function newIngredient(shopName?: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
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

export function newReview(shopName?: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
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

export function newFeedback(shopName?: string) {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";

  return createMailtoHref(
    `New Feedback for ${shopName}'s ${chocolatineName}`,
    `Hello, and thanks for your interest!

Please, tell us:



Thanks!

Arnaud, from Kiss My Chocolatine
`,
  );
}

export function makeAReferral() {
  return createMailtoHref(
    `New Referral`,
    `Hello, and thanks for your interest!

Nice to have a new user coming here! Please, write down:
- the email of the existing user that brought the new user here:
- the email of the new user:


Thanks and enjoy!

Arnaud, from Kiss My Chocolatine
`,
  );
}
