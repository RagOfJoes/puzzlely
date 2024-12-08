import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useFetcher, useLoaderData, useRouteLoaderData } from "@remix-run/react";

import { GameSummaryCard } from "@/components/game-summary-card";
import { TabsContent } from "@/components/tabs";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import { hydrateGameSummary } from "@/lib/hydrate-game-summary";
import type { loader as profileLoaderData } from "@/routes/profile";
import { API } from "@/services/api.server";
import { getSession } from "@/services/session.server";

import type { action } from "./puzzles.like.$id";

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	if (!session.get("user")) {
		return redirect("/login");
	}

	return json({
		history: await API.games.history(request, session.get("user")?.id ?? ""),
	});
}

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	// If the user likes a puzzle or updates their profile, then, there's no need to revalidate current route's loader
	const needsRevalidation = ["/puzzles/like", "/users/update"].some((value) => {
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

export default function ProfileHistory() {
	const loaderData = useLoaderData<typeof loader>();
	const routeLoaderData = useRouteLoaderData<typeof profileLoaderData>("routes/profile")!;

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

						user: routeLoaderData.me,
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
