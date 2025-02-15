import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { forwardRef } from "react";

import dayjs from "dayjs";

import { useTimezoneContext } from "@/hooks/use-timezone";

export type DateTimeProps = Omit<ComponentPropsWithoutRef<"time">, "children" | "dateTime"> & {
	dateTime: Date | string;
	format?: string;
	showRelative?: boolean;
};

export const DateTime = forwardRef<ComponentRef<"time">, DateTimeProps>(
	({ className, dateTime, format, showRelative, ...props }, ref) => {
		const { timezone } = useTimezoneContext();
		const date = dayjs(dateTime).tz(timezone);

		if (showRelative) {
			return (
				<time {...props} className={className} dateTime={date.toISOString()} ref={ref}>
					{date.fromNow()}
				</time>
			);
		}

		return (
			<time {...props} className={className} dateTime={date.toISOString()} ref={ref}>
				{date.format(format)}
			</time>
		);
	},
);
DateTime.displayName = "DateTime";
