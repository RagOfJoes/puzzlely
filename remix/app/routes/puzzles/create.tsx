import { useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { useFetcher } from "react-router";
import { getValidatedFormData } from "remix-hook-form";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/alert-dialog";
import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { PuzzleCreateForm } from "@/components/puzzle-create-form";
import { cn } from "@/lib/cn";
import { findDuplicateBlocksFromPuzzleCreatePayload } from "@/lib/find-duplicate-blocks-from-puzzle-create-payload";
import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { dataWithError, redirectWithInfo, redirectWithSuccess } from "@/services/toast.server";
import { PuzzleCreatePayloadSchema, type PuzzleCreatePayload } from "@/types/puzzle-create-payload";

import type { Route } from "./+types/create";

export async function action({ request }: Route.ActionArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING" && !me.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw await redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<PuzzleCreatePayload>(
		request,
		zodResolver(PuzzleCreatePayloadSchema),
	);

	const response: {
		defaultValues?: Partial<PuzzleCreatePayload>;
		errors?: FieldErrors<PuzzleCreatePayload>;
	} = {
		defaultValues,
		errors,
	};
	if (errors) {
		return response;
	}

	const duplicates = findDuplicateBlocksFromPuzzleCreatePayload(data);
	if (duplicates.length > 1) {
		const duplicateErrors: FieldErrors<PuzzleCreatePayload> = {};
		for (let i = 0; i < duplicates.length; i += 1) {
			const duplicate = duplicates[i];
			if (!duplicate) {
				// eslint-disable-next-line no-continue
				continue;
			}

			duplicateErrors.groups = {
				...(duplicateErrors.groups ?? {}),
				[duplicate[0]]: {
					...(duplicateErrors.groups?.[duplicate[0]] ?? {}),
					blocks: {
						...(duplicateErrors.groups?.[duplicate[0]]?.blocks ?? {}),

						[duplicate[1]]: {
							value: {
								message: "Must be unique!",
								type: "custom",
							},
						},
					},
				},
			};
		}

		return {
			...response,
			errors: duplicateErrors,
		};
	}

	const created = await API.puzzles.create(request, data);
	if (!created.success) {
		return dataWithError(response, {
			description: created.error.message,
			message: "Failed to create puzzle!",
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-throw-literal
	throw await redirectWithSuccess("/profile/created", {
		message: "Successfully created puzzle!",
	});
}

export async function loader({ request }: Route.LoaderArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING" && !me.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw await redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	return {
		me,
	};
}

export function meta(_: Route.MetaArgs) {
	return [
		{
			title: "Create | Puzzlely",
		},
	];
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>({
		key: "puzzles.create",
	});

	const form = useRef<HTMLFormElement>(null);

	return (
		<>
			<Header me={loaderData.me} />

			<main
				className={cn(
					"mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-2",

					"max-lg:min-h-[700px]",
				)}
			>
				<article className="flex h-full w-full flex-col items-center justify-center gap-1">
					<PuzzleCreateForm
						defaultValues={{
							groups: [],
						}}
						id="puzzle-create-form"
						fetcher={fetcher}
						ref={form}
					/>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								className="w-full gap-2"
								disabled={
									(fetcher.state === "loading" && !fetcher.data?.errors) ||
									fetcher.state === "submitting"
								}
								size="sm"
							>
								{fetcher.state === "submitting" && (
									<LoaderCircleIcon className="h-4 w-4 shrink-0 animate-spin" />
								)}

								{fetcher.state === "submitting" ? "Creating..." : "Create"}
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>

								<AlertDialogDescription>There is no going back.</AlertDialogDescription>
							</AlertDialogHeader>

							<div className="bg-popover p-4 text-popover-foreground">
								<p className="text-sm font-medium text-foreground">
									You will not be able to make any further modifications to this puzzle aside from
									its difficulty and group descriptions.
								</p>
							</div>

							<AlertDialogFooter>
								<AlertDialogCancel asChild>
									<Button size="sm">Wait...</Button>
								</AlertDialogCancel>

								<AlertDialogAction asChild>
									<Button
										onClick={() => {
											if (!form.current) {
												return;
											}

											form.current.dispatchEvent(new Event("submit", { bubbles: true }));
										}}
										size="sm"
										variant="ghost"
									>
										Absolutey!
									</Button>
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</article>
			</main>
		</>
	);
}
