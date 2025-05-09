import { useEffect, useState } from "react";

import type { ShouldRevalidateFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { toast as notify } from "sonner";

import { GameSummaryCard } from "@/components/game-summary-card";
import { Skeleton } from "@/components/skeleton";
import { TabsContent } from "@/components/tabs";
import { Waypoint } from "@/components/waypoint";
import { cn } from "@/lib/cn";
import { API } from "@/services/api.server";
import type { GameSummaryConnection } from "@/types/game-summary-connection";

import type { Route } from "./+types/history";

export async function loader({ params, request }: Route.LoaderArgs) {
	return {
		history: await API.games.history(request, params.id ?? ""),
	};
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

export default function Component({ loaderData, params }: Route.ComponentProps) {
	const fetcher = useFetcher<Route.ComponentProps["loaderData"]>({
		key: `users.${params.id}.history`,
	});

	const [connection, setConnection] = useState<GameSummaryConnection>(
		loaderData.history.success
			? loaderData.history.data
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
	const [hasFetched, toggleHasFetched] = useState(false);

	useEffect(() => {
		if (!hasFetched || !fetcher.data) {
			return;
		}

		if (!fetcher.data.history.success) {
			notify.error(fetcher.data.history.error.message);
			return;
		}

		if (fetcher.data.history.data.edges[0]?.cursor !== connection.page_info.next_cursor) {
			return;
		}

		setConnection((prev) => {
			if (!fetcher.data || !fetcher.data.history.success) {
				return prev;
			}

			return {
				...prev,
				edges: [...prev.edges, ...fetcher.data.history.data.edges],
				page_info: fetcher.data.history.data.page_info,
			};
		});
	}, [connection.page_info.next_cursor, fetcher.data, hasFetched]);

	return (
		<TabsContent
			aria-label="Played puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="history"
		>
			{connection.edges.map((edge) => (
				<div className="col-span-1 row-span-1" key={edge.node.id}>
					<GameSummaryCard game={edge.node} />
				</div>
			))}

			{fetcher.state === "loading" &&
				Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={`Profile-History-Skeleton-${i}`}>
						<GameSummaryCard
							className="invisible"
							game={{
								id: "",
								attempts: 0,
								score: 0,

								created_at: new Date(),

								puzzle: {
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
								},
								user: {
									id: "",
									state: "COMPLETE",
									username: "Puzzlely",

									created_at: new Date(),
								},
							}}
						/>
					</Skeleton>
				))}

			{connection.page_info.has_next_page && fetcher.state === "idle" && (
				<Waypoint
					onChange={async () => {
						if (hasFetched && fetcher.data && !fetcher.data.history.success) {
							return;
						}

						await fetcher.load(
							`/users/${params.id}/history/?cursor=${connection.page_info.next_cursor}`,
						);

						toggleHasFetched(true);
					}}
				/>
			)}
		</TabsContent>
	);
}
