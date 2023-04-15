import { useEffect, useRef } from "react";

function useUpdateEffect(
  callback: React.EffectCallback,
  deps: React.DependencyList
) {
  const renderCycleRef = useRef(false);
  const effectCycleRef = useRef(false);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const mounted = renderCycleRef.current;
    const run = mounted && effectCycleRef.current;
    if (run) {
      return callback();
    }

    effectCycleRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    renderCycleRef.current = true;

    return () => {
      renderCycleRef.current = false;
    };
  }, []);
}

export default useUpdateEffect;
