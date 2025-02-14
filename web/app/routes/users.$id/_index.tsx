import { useEffect, useState } from "react";

import dayjs from "dayjs";
import { HistoryIcon, PuzzleIcon, StarIcon } from "lucide-react";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import { redirect, Outlet, Link } from "react-router";

import { Header } from "@/components/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { API } from "@/services/api.server";

import type { Route } from "./+types/_index";

export type ValidTabs = "created" | "liked" | "history";

export async function loader({ params, request }: Route.LoaderArgs) {
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
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw redirect(`/users/${params.id}/created/`);
	}

	const [me, user] = await Promise.all([API.me(request), API.users.get(request, params.id ?? "")]);
	if (!user.success) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/");
	}

	if (me.success && user.data.id === me.data.user?.id) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/profile/");
	}

	return {
		me: me.success ? me.data?.user : undefined,
		user: user.data!,
	};
}

export function meta({ data }: Route.MetaArgs) {
	return [
		{
			title: `${data.user.username} | Puzzlely`,
		},
		{
			name: "description",
			content: `View ${data.user.username}'s created, liked, and played puzzles.`,
		},
	];
}

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

export default function Component({ loaderData, matches }: Route.ComponentProps) {
	const [tab, setTab] = useState<ValidTabs>(() => {
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/users.$id/history":
				return "history";
			case "routes/users.$id/liked":
				return "liked";
			default:
				return "created";
		}
	});

	useEffect(() => {
		let newTab: ValidTabs;
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/users.$id/history":
				newTab = "history";
				break;
			case "routes/users.$id/liked":
				newTab = "liked";
				break;
			default:
				newTab = "created";
				break;
		}

		setTab(newTab);
	}, [matches, tab]);

	return (
		<>
			<Header me={loaderData.me} />

			<main className="mx-auto min-h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<div className="flex h-full w-full flex-col gap-1">
					<div className="flex flex-col gap-2 rounded-xl border bg-card px-4 py-4">
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

					<Tabs value={tab}>
						<TabsList className="w-full">
							<TabsTrigger asChild value="created">
								<Link to={`/users/${loaderData.user.id}/created/`}>
									<PuzzleIcon className="h-4 w-4" />
									Created
								</Link>
							</TabsTrigger>
							<TabsTrigger asChild value="liked">
								<Link to={`/users/${loaderData.user.id}/liked/`}>
									<StarIcon className="h-4 w-4" />
									Liked
								</Link>
							</TabsTrigger>
							<TabsTrigger asChild value="history">
								<Link to={`/users/${loaderData.user.id}/history/`}>
									<HistoryIcon className="h-4 w-4" />
									History
								</Link>
							</TabsTrigger>
						</TabsList>

						<Outlet />
					</Tabs>
				</div>
			</main>
		</>
	);
}
