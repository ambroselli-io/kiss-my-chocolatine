import Cookies from "js-cookie";

export default function useChocolatineName() {
  const chocolatineName = Cookies.get("chocolatine-name") || "pain au chocolat";
  const chocolatinesName =
    Cookies.get("chocolatines-name") || "pains au chocolat";

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const newAppName = `Kiss\u00A0My\u00A0${chocolatineName
    .split(" ")
    .map(capitalize)
    .join("\u00A0")}`;

  return {
    chocolatineName,
    chocolatinesName,
    newAppName,
  };
}
