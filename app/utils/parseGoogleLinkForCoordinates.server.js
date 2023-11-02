// import clipboardy from "clipboardy";

export default async function parseGoogleLinkForCoordinates(rawGoogleLink) {
  // google link can be
  // -> https://maps.app.goo.gl/2PScR6bSNXJUyns57
  // ->https://www.google.com/maps/place/Le+Pain+Retrouvé/@48.8777186,2.3396138,17z/data=!3m2!4b1!5s0x47e66e473872ba6b:0xf7d926070e69fc39!4m6!3m5!1s0x47e66f897294d69b:0x37816e98cb091727!8m2!3d48.8777186!4d2.3396138!16s%2Fg%2F11qqj676ry?entry=ttu

  let coordinates = await fetch(rawGoogleLink)
    .then((res) => res.text())
    .then((html) => {
      // copy content to clipboard
      // clipboardy.writeSync(html);
      // find all the occurences of string like "@48.8777186,2.3396138" in the test
      const coordintesRegexp =
        /@[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)?/g;
      const coordinates = html.match(coordintesRegexp);
      return coordinates[0];
    })
    .then((rawCoordinates) => {
      return rawCoordinates.replace("@", "").split(",");
    })
    .then(([latitude, longitude]) => ({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }));

  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
}
