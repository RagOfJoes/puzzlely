import { useEffect, useRef } from "react";

function useIsFirstRender() {
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return isFirstRender.current;
}

export default useIsFirstRender;
