import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { useFormControlProps } from "@/components/form-control";
import { cn } from "@/lib/cn";
import { omit } from "@/lib/omit";
import { pick } from "@/lib/pick";

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
	invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
	const { children, className, placeholder = "...", ...other } = props;

	const ctx = useFormControlProps(
		pick(props, ["disabled", "id", "invalid", "readOnly", "required"]),
	);

	return (
		<textarea
			{...omit(other, ["disabled", "id", "invalid", "readOnly", "required"])}
			{...omit(ctx, ["invalid"])}
			ref={ref}
			className={cn(
				"relative h-11 min-h-[5rem] w-full min-w-0 resize-none appearance-none border bg-muted px-4 py-2 font-medium outline-none ring-offset-background transition-[background-color,box-shadow,color]",

				"aria-[invalid=true]:enabled:border-destructive",
				"disabled:text-muted-foreground",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"placeholder:enabled:text-muted-foreground",

				className,
			)}
			placeholder={placeholder}
		>
			{children}
		</textarea>
	);
});
Textarea.displayName = "Textarea";
