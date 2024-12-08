import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { GameSummaryCard } from "@/components/game-summary-card";
import { TabsContent } from "@/components/tabs";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import { hydrateGameSummary } from "@/lib/hydrate-game-summary";
import { API } from "@/services/api.server";

import type { action } from "./puzzles.like.$id";

export async function loader({ params, request }: LoaderFunctionArgs) {
	return json({
		history: await API.games.history(request, params.id ?? ""),
	});
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

export default function UserHistory() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<TabsContent
			aria-label="Played puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="history"
		>
			{loaderData.history.success &&
				loaderData.history.data.edges.map((edge) => {
					const game = hydrateGameSummary({
						...edge.node,
					});

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const fetcher = useFetcher<typeof action>({
						key: `puzzles.like.${game.puzzle.id}`,
					});

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const optimisticLike = usePuzzleOptimisticLike(fetcher, game.puzzle);

					return (
						<div className="col-span-1 row-span-1" key={edge.node.id}>
							<GameSummaryCard
								game={{
									...game,

									puzzle: {
										...game.puzzle,

										liked_at: optimisticLike.liked_at,
										num_of_likes: optimisticLike.num_of_likes,
									},
								}}
							/>
						</div>
					);
				})}
		</TabsContent>
	);
}
