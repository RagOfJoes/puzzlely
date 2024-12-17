import type { ShouldRevalidateFunctionArgs } from "react-router";
import { useFetcher } from "react-router";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { TabsContent } from "@/components/tabs";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/puzzles/like.$id";
import { API } from "@/services/api.server";

import type { Route } from "./+types/liked";

export async function loader({ params, request }: Route.LoaderArgs) {
	return {
		liked: await API.puzzles.liked(request, params.id ?? ""),
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

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<TabsContent
			aria-label="Liked puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="liked"
		>
			{loaderData.liked.success &&
				loaderData.liked.data.edges.map((edge) => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					const fetcher = useFetcher<typeof action>({
						key: `puzzles.like.${edge.node.id}`,
					});

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const optimisticLike = usePuzzleOptimisticLike(fetcher, edge.node);

					return (
						<div className="col-span-1 row-span-1" key={edge.node.id}>
							<PuzzleSummaryCard
								puzzle={{
									...edge.node,

									liked_at: optimisticLike.liked_at,
									num_of_likes: optimisticLike.num_of_likes,
								}}
							/>
						</div>
					);
				})}
		</TabsContent>
	);
}
