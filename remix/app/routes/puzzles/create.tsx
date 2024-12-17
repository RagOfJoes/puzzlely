import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { useFetcher } from "react-router";
import { getValidatedFormData } from "remix-hook-form";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { PuzzleCreateForm } from "@/components/puzzle-create-form";
import { cn } from "@/lib/cn";
import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { dataWithError, redirectWithInfo, redirectWithSuccess } from "@/services/toast.server";
import { PuzzleCreatePayloadSchema, type PuzzleCreatePayload } from "@/types/puzzle-create-payload";

import type { Route } from "./+types/create";

export async function action({ request }: Route.ActionArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING" && !me.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirectWithInfo("/profile/complete", {
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

	const created = await API.puzzles.create(request, data);
	if (!created.success) {
		return dataWithError(response, {
			description: created.error.message,
			message: "Failed to create puzzle!",
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-throw-literal
	throw redirectWithSuccess("/profile/created", {
		message: "Successfully created puzzle!",
	});
}

export async function loader({ request }: Route.LoaderArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING" && !me.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirectWithInfo("/profile/complete", {
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
					/>

					<Button
						className="w-full gap-2"
						disabled={
							(fetcher.state === "loading" && !fetcher.data?.errors) ||
							fetcher.state === "submitting"
						}
						form="puzzle-create-form"
						size="sm"
					>
						{fetcher.state === "submitting" && (
							<LoaderCircleIcon className="h-4 w-4 shrink-0 animate-spin" />
						)}

						{fetcher.state === "submitting" ? "Creating..." : "Create"}
					</Button>
				</article>
			</main>
		</>
	);
}
