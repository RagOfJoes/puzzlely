import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Form } from "react-router";
import type { UseRemixFormOptions } from "remix-hook-form";
import { RemixFormProvider, useRemixForm } from "remix-hook-form";

import { Input } from "@/components//input";
import { FormControl, FormControlError, FormControlLabel } from "@/components/form-control";
import { cn } from "@/lib/cn";
import { UserUpdatePayloadSchema, type UserUpdatePayload } from "@/types/user-update-payload";

export type UserUpdateFormProps = Omit<
	ComponentPropsWithoutRef<typeof Form>,
	"children" | "defaultValue" | "onSubmit"
> &
	Pick<UseRemixFormOptions<UserUpdatePayload>, "defaultValues" | "fetcher">;

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
					className={cn(
						"flex h-full w-full flex-col gap-1",

						className,
					)}
					onSubmit={form.handleSubmit}
					ref={ref}
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
