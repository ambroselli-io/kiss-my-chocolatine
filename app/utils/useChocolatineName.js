import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";

export default function useChocolatineName() {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const [chocolatineName, setChocolatineName] = useState("pain au chocolat");
  const [chocolatinesName, setChocolatinesName] = useState("pains au chocolat");
  const [newAppName, setNewAppName] = useState("Kiss\u00A0My\u00A0Chocolatine");

  useEffect(() => {
    const newChocolatineName =
      Cookies.get("chocolatine-name") || "pain au chocolat";
    setChocolatineName(newChocolatineName);
    setChocolatinesName(
      Cookies.get("chocolatines-name") || "pains au chocolat",
    );
    setNewAppName(
      `Kiss\u00A0My\u00A0${newChocolatineName
        .split(" ")
        .map(capitalize)
        .join("\u00A0")}`,
    );
  }, []);

  return {
    chocolatineName,
    chocolatinesName,
    newAppName,
  };
}
