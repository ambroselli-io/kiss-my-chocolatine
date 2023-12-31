import Cookies from "js-cookie";

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function useChocolatineName() {
  const chocolatineName =
    typeof window === "undefined"
      ? "chocolatine"
      : Cookies.get("chocolatine-name") || "chocolatine";
  const chocolatinesName = Cookies.get("chocolatines-name") || "chocolatines";

  const capitalizedChocolatineName = chocolatineName
    .split(" ")
    .map(capitalize)
    .join("\u00A0");
  // const newAppName = `Kiss\u00A0My\u00A0${"chocolatine"
  const newAppName = `Kiss\u00A0My\u00A0${capitalizedChocolatineName}`;

  return {
    chocolatineName,
    chocolatinesName,
    capitalizedChocolatineName,
    newAppName,
  };
}
