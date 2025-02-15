import { createContext } from "@/lib/create-context";

export type UseTimezoneProps = {
	timezone: string;
};

export type UseTimezone = {
	timezone: string;
};

export const [TimezoneProvider, useTimezoneContext] = createContext<UseTimezone>({
	hookName: "useTimezoneContext",
	name: "Timezone",
	providerName: "TimezoneProvider",
});

export function useTimezone(props: UseTimezoneProps): UseTimezone {
	return {
		timezone: props.timezone,
	};
}
