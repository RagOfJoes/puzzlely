import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializeFrom } from "@remix-run/node";
import type { Form, FetcherWithComponents } from "@remix-run/react";
import type { FieldErrors } from "react-hook-form";
import { RemixFormProvider, useRemixForm } from "remix-hook-form";

import { cn } from "@/lib/cn";
import { PuzzleCreatePayloadSchema } from "@/schemas/puzzle-create-payload";
import type { PuzzleCreatePayload } from "@/types/puzzle-create-payload";

import { PuzzleCreateFormGroups } from "./puzzle-create-form-groups";
import { PuzzleCreateFormMeta } from "./puzzle-create-form-meta";

export type PuzzleCreateFormProps = Omit<
	ComponentPropsWithoutRef<typeof Form>,
	"children" | "defaultValue" | "onSubmit"
> & {
	defaultValues?: Partial<PuzzleCreatePayload>;
	fetcher?: FetcherWithComponents<
		SerializeFrom<{
			defaultValues?: Partial<PuzzleCreatePayload>;
			errors?: FieldErrors<PuzzleCreatePayload>;
		}>
	>;
};

export const PuzzleCreateForm = forwardRef<ElementRef<typeof Form>, PuzzleCreateFormProps>(
	({ className, defaultValues, fetcher, ...props }, ref) => {
		const form = useRemixForm<PuzzleCreatePayload>({
			defaultValues,
			fetcher,
			mode: "onBlur",
			resolver: zodResolver(PuzzleCreatePayloadSchema),
		});

		return (
			<RemixFormProvider {...form}>
				<form
					{...props}
					className={cn(
						"flex h-full w-full flex-col gap-1",

						className,
					)}
					method="POST"
					onSubmit={form.handleSubmit}
					ref={ref}
				>
					<PuzzleCreateFormMeta />
					<PuzzleCreateFormGroups />
				</form>
			</RemixFormProvider>
		);
	},
);
PuzzleCreateForm.displayName = "PuzzleCreateForm";
