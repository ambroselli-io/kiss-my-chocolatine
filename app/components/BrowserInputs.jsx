import { useMemo } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { detect } from "detect-browser";

export default function BrowserInputs() {
  const browser = useMemo(() => {
    const browser = detect();
    var isHomescreen =
      typeof window !== "undefined" &&
      (window.navigator.standalone ||
        (window.matchMedia &&
          window.matchMedia("(display-mode: standalone)").matches));

    return { ...browser, isHomescreen };
  }, []);

  return (
    <ClientOnly>
      {() => (
        <>
          <input
            type="hidden"
            name="is_mobile"
            value={window.innerWidth <= 640}
          />
          <input
            type="hidden"
            name="is_homescreen"
            value={browser.isHomescreen}
          />
          <input
            type="hidden"
            name="is_app"
            value={window.ENV.APP_PLATFORM === "native"}
          />
          <input type="hidden" name="browser_type" value={browser.type} />
          <input type="hidden" name="browser_name" value={browser.name} />
          <input type="hidden" name="browser_version" value={browser.version} />
          <input type="hidden" name="browser_os" value={browser.os} />
        </>
      )}
    </ClientOnly>
  );
}
