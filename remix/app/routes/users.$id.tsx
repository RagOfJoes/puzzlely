import { useState } from "react";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { Outlet, useLoaderData, useMatches, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { Heart, History, Puzzle } from "lucide-react";

import { Header } from "@/components/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { hydrateUser } from "@/lib/hydrate-user";
import { API } from "@/services/api.server";

export type ValidTabs = "created" | "liked" | "history";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const split = url.pathname.split("/").filter((str) => str.length > 0);
	switch (split[split.length - 1]) {
		case "created":
			break;
		case "liked":
			break;
		case "history":
			break;
		default:
			return redirect(`/users/${params.id}/created/`);
	}

	const [me, user] = await Promise.all([API.me(request), API.users.get(request, params.id ?? "")]);
	if (!user.success) {
		return redirect("/");
	}

	if (me.success && user.data.id === me.data.user?.id) {
		return redirect("/profile");
	}

	return json({
		me: me.success ? me.data?.user : undefined,
		user: user.data!,
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [
			{
				title: "User | Puzzlely",
			},
		];
	}

	return [
		{
			title: `${data.user.username} | Puzzlely`,
		},
	];
};

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	if (!formAction?.includes("/puzzles/like/")) {
		return defaultShouldRevalidate;
	}

	// Don't need to re-run loader when the user likes the puzzle
	return false;
}

export default function User() {
	const loaderData = useLoaderData<typeof loader>();
	const matches = useMatches();
	const navigate = useNavigate();

	const [tab, setTab] = useState<ValidTabs>(() => {
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/users.$id.history":
				return "history";
			case "routes/users.$id.liked":
				return "liked";
			default:
				return "created";
		}
	});

	return (
		<>
			<Header me={loaderData.me ? hydrateUser(loaderData.me) : undefined} />

			<main className="mx-auto h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col gap-1">
					<div className="flex flex-col gap-2 border bg-background px-4 py-4">
						<div className="flex gap-2">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-xl font-semibold text-muted">
								{loaderData.user.username[0]}
							</div>

							<div className="flex items-center overflow-hidden">
								<p className="truncate text-xl font-semibold">{loaderData.user.username}</p>
							</div>
						</div>

						<div className="flex w-full items-center gap-1">
							<div className="flex w-full flex-col gap-1">
								<p className="text-sm text-muted-foreground">Joined</p>

								<p className="font-medium leading-none">
									{dayjs(loaderData.user.created_at).format("MMM DD, YYYY")}
								</p>
							</div>

							<div className="flex w-full flex-col gap-1">
								<p className="text-sm text-muted-foreground">Updated at</p>

								<p className="font-medium leading-none">
									{loaderData.user.updated_at
										? dayjs(loaderData.user.updated_at).format("MMM DD, YYYY")
										: "N/A"}
								</p>
							</div>
						</div>
					</div>

					<Tabs
						onValueChange={(newTab) => {
							if (newTab !== "created" && newTab !== "liked" && newTab !== "history") {
								return;
							}

							setTab(newTab);

							navigate(`/users/${loaderData.user.id}/${newTab}/`, {
								preventScrollReset: true,
							});
						}}
						value={tab}
					>
						<TabsList className="w-full">
							<TabsTrigger value="created">
								<Puzzle className="h-4 w-4" />
								Created
							</TabsTrigger>
							<TabsTrigger value="liked">
								<Heart className="h-4 w-4" />
								Liked
							</TabsTrigger>
							<TabsTrigger value="history">
								<History className="h-4 w-4" />
								History
							</TabsTrigger>
						</TabsList>

						<Outlet />
					</Tabs>
				</article>
			</main>
		</>
	);
}
