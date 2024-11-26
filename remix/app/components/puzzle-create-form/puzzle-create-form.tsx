import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Form, FetcherWithComponents } from "@remix-run/react";
import { LoaderCircleIcon } from "lucide-react";
import { RemixFormProvider, useRemixForm } from "remix-hook-form";

import { Button } from "@/components/button";
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
	fetcher?: FetcherWithComponents<PuzzleCreatePayload>;
};

export const PuzzleCreateForm = forwardRef<ElementRef<typeof Form>, PuzzleCreateFormProps>(
	(props, ref) => {
		const { className, defaultValues, fetcher, ...other } = props;

		const form = useRemixForm<PuzzleCreatePayload>({
			defaultValues,
			fetcher,
			mode: "onBlur",
			resolver: zodResolver(PuzzleCreatePayloadSchema),
		});

		return (
			<RemixFormProvider {...form}>
				<form
					{...other}
					method="POST"
					ref={ref}
					className={cn(
						"flex h-full w-full flex-col gap-1",

						className,
					)}
					onSubmit={form.handleSubmit}
				>
					<PuzzleCreateFormMeta />
					<PuzzleCreateFormGroups />

					<Button
						className="w-full gap-2"
						disabled={
							!form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting
						}
						size="lg"
					>
						{form.formState.isSubmitting && (
							<LoaderCircleIcon className="fill-tex h-4 w-4 shrink-0 animate-spin" />
						)}

						{form.formState.isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				</form>
			</RemixFormProvider>
		);
	},
);
PuzzleCreateForm.displayName = "PuzzleCreateForm";
