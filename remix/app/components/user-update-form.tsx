import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Form, FetcherWithComponents } from "@remix-run/react";
import { RemixFormProvider, useRemixForm } from "remix-hook-form";

import { cn } from "@/lib/cn";
import { UserUpdatePayloadSchema } from "@/schemas/user-update-payload";
import type { UserUpdatePayload } from "@/types/user-update-payload";

import { FormControl, FormControlError, FormControlLabel } from "./form-control";
import { Input } from "./input";

export type UserUpdateFormProps = Omit<
	ComponentPropsWithoutRef<typeof Form>,
	"children" | "defaultValue" | "onSubmit"
> & {
	defaultValues?: Partial<UserUpdatePayload>;
	fetcher?: FetcherWithComponents<UserUpdatePayload>;
};

export const UserUpdateForm = forwardRef<ElementRef<typeof Form>, UserUpdateFormProps>(
	({ action, className, defaultValues, fetcher, method, ...props }, ref) => {
		const form = useRemixForm<UserUpdatePayload>({
			defaultValues,
			fetcher,
			mode: "onBlur",
			resolver: zodResolver(UserUpdatePayloadSchema),
			submitConfig: {
				action,
				method,
			},
		});

		return (
			<RemixFormProvider {...form}>
				<form
					{...props}
					ref={ref}
					className={cn(
						"flex h-full w-full flex-col gap-1",

						className,
					)}
					onSubmit={form.handleSubmit}
				>
					<FormControl
						className={cn(
							"w-full basis-1/2",

							"max-md:basis-full",
						)}
						invalid={!!form.formState.errors.username?.message}
						required
					>
						<FormControlLabel>Username</FormControlLabel>

						<Input {...form.register("username")} placeholder="..." />

						<FormControlError>{form.formState.errors.username?.message}</FormControlError>
					</FormControl>
				</form>
			</RemixFormProvider>
		);
	},
);
UserUpdateForm.displayName = "UserUpdateForm";
