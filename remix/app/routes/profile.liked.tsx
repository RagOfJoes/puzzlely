import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, type ShouldRevalidateFunctionArgs } from "@remix-run/react";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { TabsContent } from "@/components/tabs";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import { hydratePuzzleSummary } from "@/lib/hydrate-puzzle-summary";
import { API } from "@/services/api.server";
import { getSession } from "@/services/session.server";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { Response } from "@/types/response";

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	if (!session.get("user")) {
		return redirect("/login");
	}

	return json({
		liked: await API.puzzles.liked(request, session.get("user")?.id ?? ""),
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

export default function ProfileLiked() {
	const loaderData = useLoaderData<typeof loader>();

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
					const puzzle = hydratePuzzleSummary(edge.node);

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const fetcher = useFetcher<Response<PuzzleLike>>({
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
