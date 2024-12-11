import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { LoaderCircleIcon } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { getValidatedFormData } from "remix-hook-form";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { PuzzleCreateForm } from "@/components/puzzle-create-form";
import { cn } from "@/lib/cn";
import { hydrateUser } from "@/lib/hydrate-user";
import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { jsonWithError, redirectWithInfo, redirectWithSuccess } from "@/services/toast.server";
import { PuzzleCreatePayloadSchema, type PuzzleCreatePayload } from "@/types/puzzle-create-payload";

export async function action({ request }: ActionFunctionArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING" && !me.updated_at) {
		return redirectWithInfo("/profile/complete", {
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
		return json(response);
	}

	const created = await API.puzzles.create(request, data);
	if (!created.success) {
		return jsonWithError(response, {
			description: created.error.message,
			message: "Failed to create puzzle!",
		});
	}

	return redirectWithSuccess("/profile/created", {
		message: "Successfully created puzzle!",
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING" && !me.updated_at) {
		return redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	return json({
		me,
	});
}

export const meta: MetaFunction<typeof loader> = () => [
	{
		title: "Create | Puzzlely",
	},
];

export default function PuzzleCreate() {
	const loaderData = useLoaderData<typeof loader>();

	const fetcher = useFetcher<typeof action>({
		key: "puzzles.create",
	});

	return (
		<>
			<Header me={hydrateUser(loaderData.me)} />

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
						size="sm"
					>
						{fetcher.state === "submitting" && (
							<LoaderCircleIcon className="h-4 w-4 shrink-0 animate-spin" />
						)}

						{fetcher.state === "submitting" ? "Submitting..." : "Complete"}
					</Button>
				</article>
			</main>
		</>
	);
}
