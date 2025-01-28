import { useEffect, useState } from "react";

import {
	useFetcher,
	type LoaderFunctionArgs,
	type ShouldRevalidateFunctionArgs,
} from "react-router";
import { toast as notify } from "sonner";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { Skeleton } from "@/components/skeleton";
import { TabsContent } from "@/components/tabs";
import { Waypoint } from "@/components/waypoint";
import { cn } from "@/lib/cn";
import { API } from "@/services/api.server";
import type { PuzzleSummaryConnection } from "@/types/puzzle-summary-connection";

import type { Route } from "./+types/created";

export async function loader({ params, request }: LoaderFunctionArgs) {
	return {
		created: await API.puzzles.created(request, params.id ?? ""),
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

export default function Component({ params, loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher<Route.ComponentProps["loaderData"]>({
		key: `users.${params.id}.created`,
	});

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
	const [hasFetched, toggleHasFetched] = useState(false);

	useEffect(() => {
		if (!fetcher.data) {
			return;
		}

		if (!fetcher.data.created.success) {
			notify.error(fetcher.data.created.error.message);
			return;
		}

		if (fetcher.data.created.data.edges[0]?.cursor !== connection.page_info.next_cursor) {
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
	}, [connection.page_info.next_cursor, fetcher.data]);

	return (
		<TabsContent
			aria-label="Created puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="created"
		>
			{connection.edges.map((edge) => (
				<div className="col-span-1 row-span-1" key={edge.node.id}>
					<PuzzleSummaryCard puzzle={edge.node} />
				</div>
			))}

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

			{fetcher.state === "loading" &&
				Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={`Users-Created-Skeleton-${i}`}>
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

			{connection.page_info.has_next_page && fetcher.state === "idle" && (
				<Waypoint
					onChange={async () => {
						if (hasFetched && fetcher.data && !fetcher.data.created.success) {
							return;
						}

						await fetcher.load(
							`/users/${params.id}/created/?cursor=${connection.page_info.next_cursor}`,
						);

						toggleHasFetched(true);
					}}
				/>
			)}
		</TabsContent>
	);
}
