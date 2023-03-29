import { useEffect } from "react";

import * as Panelbear from "@panelbear/panelbear-js";
import { useRouter } from "next/router";

function usePanelbear(site: string, config: Panelbear.PanelbearConfig = {}) {
  const router = useRouter();

  useEffect(() => {
    Panelbear.load(site, config);

    // Trigger initial page view
    Panelbear.trackPageview();

    // Add on route change handler for client-side navigation
    const handleRouteChange = () => Panelbear.trackPageview();
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);
}

export default usePanelbear;
