import Cookies from "js-cookie";

export default function useChocolatineName() {
  const chocolatineName =
    typeof window === "undefined"
      ? "chocolatine"
      : Cookies.get("chocolatine-name") || "chocolatine";
  const chocolatinesName = Cookies.get("chocolatines-name") || "chocolatines";

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // const newAppName = `Kiss\u00A0My\u00A0${chocolatineName
  const newAppName = `Kiss\u00A0My\u00A0${"chocolatine"
    .split(" ")
    .map(capitalize)
    .join("\u00A0")}`;

  return {
    chocolatineName,
    chocolatinesName,
    newAppName,
  };
}
