import type { ShouldRevalidateFunctionArgs } from "react-router";
import { redirect, useFetcher, useRouteLoaderData } from "react-router";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { TabsContent } from "@/components/tabs";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/puzzles/like.$id";
import { API } from "@/services/api.server";
import { getSession } from "@/services/session.server";
import type { PuzzleSummary } from "@/types/puzzle-summary";

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
	const routeLoaderData =
		useRouteLoaderData<ParentRoute.ComponentProps["loaderData"]>("routes/profile/_index")!;

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
					const puzzle: PuzzleSummary = {
						...edge.node,

						created_by: routeLoaderData.me,
					};

					// eslint-disable-next-line react-hooks/rules-of-hooks
					const fetcher = useFetcher<typeof action>({
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
