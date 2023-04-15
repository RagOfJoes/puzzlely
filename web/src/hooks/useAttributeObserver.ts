import type { RefObject } from "react";
import { useEffect } from "react";

function useAttributeObserver(
  ref: RefObject<HTMLElement | null>,
  attributes: string | string[],
  fn: (v: MutationRecord) => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!ref.current || !enabled) {
      return;
    }

    const win = ref.current.ownerDocument.defaultView ?? window;
    const attrs = Array.isArray(attributes) ? attributes : [attributes];
    const obs = new win.MutationObserver((changes) => {
      changes.forEach((change) => {
        if (
          change.type === "attributes" &&
          change.attributeName &&
          attrs.includes(change.attributeName)
        ) {
          fn(change);
        }
      });
    });

    obs.observe(ref.current, { attributes: true, attributeFilter: attrs });

    // eslint-disable-next-line consistent-return
    return () => {
      obs.disconnect();
    };
  });
}

export default useAttributeObserver;
