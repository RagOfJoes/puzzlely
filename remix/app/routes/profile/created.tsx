import { useEffect, useState } from "react";

import type { ShouldRevalidateFunctionArgs } from "react-router";
import { redirect, useFetcher, useRouteLoaderData } from "react-router";
import { toast as notify } from "sonner";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { Skeleton } from "@/components/skeleton";
import { TabsContent } from "@/components/tabs";
import { Waypoint } from "@/components/waypoint";
import { cn } from "@/lib/cn";
import { API } from "@/services/api.server";
import { getSession } from "@/services/session.server";
import type { PuzzleSummary } from "@/types/puzzle-summary";
import type { PuzzleSummaryConnection } from "@/types/puzzle-summary-connection";

import type { Route as ParentRoute } from "./+types/_index";
import type { Route } from "./+types/created";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	if (!session.get("user")) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/login");
	}

	return {
		created: await API.puzzles.created(request, session.get("user")?.id ?? ""),
	};
}

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	// If the user likes a puzzle or updates their profile, then, there's no need to revalidate current route's loader
	const needsRevalidation = ["/games/sync", "/profile", "/puzzles/like"].some((value) => {
		if (!formAction) {
			return false;
		}

		return formAction.includes(value);
	});
	if (!needsRevalidation) {
		return defaultShouldRevalidate;
	}

	// Don't need to re-run loader when the user likes the puzzle
	return false;
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher<Route.ComponentProps["loaderData"]>({
		key: "profile.created",
	});
	const routeLoaderData =
		useRouteLoaderData<ParentRoute.ComponentProps["loaderData"]>("routes/profile/_index")!;

	const [connection, setConnection] = useState<PuzzleSummaryConnection>(
		loaderData.created.success
			? loaderData.created.data
			: {
					edges: [],
					page_info: {
						has_next_page: false,
						has_previous_page: false,
						next_cursor: "",
						previous_cursor: "",
					},
				},
	);

	useEffect(() => {
		switch (fetcher.state) {
			case "loading":
				break;
			case "submitting":
				break;
			default:
				if (!fetcher.data) {
					return;
				}

				if (!fetcher.data.created.success) {
					notify.error(fetcher.data.created.error.message);
					return;
				}

				setConnection((prev) => {
					if (!fetcher.data || !fetcher.data.created.success) {
						return prev;
					}

					return {
						...prev,
						edges: [...prev.edges, ...fetcher.data.created.data.edges],
						page_info: fetcher.data.created.data.page_info,
					};
				});
		}
	}, [fetcher.data, fetcher.state]);

	return (
		<TabsContent
			aria-label="Created puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="created"
		>
			{connection.edges.map((edge) => {
				const puzzle: PuzzleSummary = {
					...edge.node,

					created_by: routeLoaderData.me,
				};

				return (
					<div className="col-span-1 row-span-1" key={edge.node.id}>
						<PuzzleSummaryCard puzzle={puzzle} />
					</div>
				);
			})}

			{fetcher.state === "loading" &&
				Array.from({ length: 2 }).map((_, i) => (
					<Skeleton key={`Profile-Created-Skeleton-${i}`}>
						<PuzzleSummaryCard
							className="invisible"
							puzzle={{
								id: "",
								difficulty: "Medium",
								max_attempts: 6,

								num_of_likes: 10,

								created_by: {
									id: "",
									state: "COMPLETE",
									username: "Puzzlely",

									created_at: new Date(),
								},

								created_at: new Date(),
							}}
						/>
					</Skeleton>
				))}

			{connection.page_info.has_next_page && (
				<Waypoint
					onInView={async () => {
						if (fetcher.state !== "idle") {
							return;
						}

						// Handle potential duplicate requests
						if (
							fetcher.data &&
							fetcher.data.created.success &&
							fetcher.data.created.data.page_info.next_cursor !== connection.page_info.next_cursor
						) {
							return;
						}

						await fetcher.load(`/profile/created/?cursor=${connection.page_info.next_cursor}`);
					}}
				/>
			)}
		</TabsContent>
	);
}
