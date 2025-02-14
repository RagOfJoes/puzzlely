import { useCallback, useEffect, useRef } from "react";

export function useIsMounted(): () => boolean {
	const ref = useRef<boolean>(false);
	const get = useCallback(() => ref.current, []);

	useEffect(() => {
		ref.current = true;

		return () => {
			ref.current = false;
		};
	}, []);

	return get;
}
