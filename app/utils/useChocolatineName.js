import Cookies from "js-cookie";
import { useOutletContext } from "@remix-run/react";

export default function useChocolatineName() {
  const context = useOutletContext();

  console.log("context", context);

  return {
    chocolatineName: context?.chocolatineName ?? Cookies.get("chocolatineName") ?? "chocolatine",
    chocolatinesName: context?.chocolatinesName ?? Cookies.get("chocolatinesName") ?? "chocolatines",
    capitalizedChocolatineName: context?.capitalizedChocolatineName ?? "Chocolatine",
    newAppName: context?.newAppName ?? "Kiss My Chocolatine",
  };
}
