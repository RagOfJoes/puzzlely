import { zodResolver } from "@hookform/resolvers/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { getValidatedFormData } from "remix-hook-form";

import { Header } from "@/components/header";
import { PuzzleCreateForm } from "@/components/puzzle-create-form";
import { cn } from "@/lib/cn";
import { hydrateUser } from "@/lib/hydrate-user";
import { requireUser } from "@/lib/require-user";
import { PuzzleCreatePayloadSchema } from "@/schemas/puzzle-create-payload";
import { API } from "@/services/api.server";
import { commitSession, getSession } from "@/services/session.server";
import type { PuzzleCreatePayload } from "@/types/puzzle-create-payload";

export async function action({ request }: ActionFunctionArgs) {
	await requireUser(request);

	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<PuzzleCreatePayload>(
		request,
		zodResolver(PuzzleCreatePayloadSchema),
	);

	if (errors) {
		return json({ errors, defaultValues });
	}

	const session = await getSession(request.headers.get("Cookie"));

	const created = await API.puzzles.create(request, data);
	if (!created.success) {
		session.flash("error", created.error);

		return json(
			{
				defaultValues,
			},
			{
				headers: {
					"Set-Cookie": await commitSession(session, {
						maxAge: dayjs(session.data.expires_at).diff(undefined, "seconds"),
					}),
				},
			},
		);
	}

	return redirect("/profile/created", {
		headers: {
			"Set-Cookie": await commitSession(session, {
				maxAge: dayjs(session.data.expires_at).diff(undefined, "seconds"),
			}),
		},
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	const me = await requireUser(request);

	const session = await getSession(request.headers.get("Cookie"));
	session.flash("error", "Testing");

	return json(
		{
			error: session.get("error"),
			me,
		},
		{
			headers: {
				"Set-Cookie": await commitSession(session, {
					maxAge: dayjs(session.data.expires_at).diff(undefined, "seconds"),
				}),
			},
		},
	);
}

export const meta: MetaFunction<typeof loader> = () => [
	{
		title: "Create | Puzzlely",
	},
];

export default function PuzzleCreate() {
	const loaderData = useLoaderData<typeof loader>();

	const fetcher = useFetcher<PuzzleCreatePayload>({
		key: "puzzles/create",
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
				<PuzzleCreateForm
					defaultValues={{
						groups: [],
					}}
					fetcher={fetcher}
				/>
			</main>
		</>
	);
}
