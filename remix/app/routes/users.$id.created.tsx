import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { TabsContent } from "@/components/tabs";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import { hydratePuzzleSummary } from "@/lib/hydrate-puzzle-summary";
import { API } from "@/services/api.server";
import type { PuzzleLike } from "@/types/puzzle-like";

export async function loader({ params, request }: LoaderFunctionArgs) {
	return json({
		created: await API.puzzles.created(request, params.id ?? ""),
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

export default function UserCreated() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<TabsContent
			aria-label="Created puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="created"
		>
			{loaderData.created.success &&
				loaderData.created.data.edges.map((edge) => {
					const puzzle = hydratePuzzleSummary(edge.node);

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const fetcher = useFetcher<PuzzleLike>({
						key: `puzzles.like.${puzzle.id}`,
					});

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const optimisticLike = usePuzzleOptimisticLike(fetcher, puzzle);

					return (
						<div className="col-span-1 row-span-1" key={edge.node.id}>
							<PuzzleSummaryCard
								puzzle={{
									...puzzle,

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
