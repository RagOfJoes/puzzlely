import { useEffect, useState } from "react";

import { off, on } from "@/lib/listeners";

export function useIsOnline() {
	const [state, setState] = useState<boolean>(
		typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
			? navigator.onLine
			: true,
	);

	useEffect(() => {
		const onOffline = () => {
			setState(false);
		};
		const onOnline = () => {
			setState(true);
		};

		on(window, "online", onOnline, { passive: true });
		on(window, "offline", onOffline, { passive: true });

		return () => {
			off(window, "online", onOnline);
			off(window, "offline", onOffline);
		};
	}, []);

	return state;
}
