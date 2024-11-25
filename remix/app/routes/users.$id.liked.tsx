import { Suspense } from "react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { Skeleton } from "@/components/skeleton";
import { TabsContent } from "@/components/tabs";
import { cn } from "@/lib/cn";
import { hydratePuzzleSummary } from "@/lib/hydrate-puzzle-summary";
import { API } from "@/services/api.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const liked = API.puzzles.liked(request, params.id ?? "");

	return defer({
		liked,
	});
}

export default function UserLiked() {
	const data = useLoaderData<typeof loader>();

	return (
		<TabsContent
			aria-label="Liked puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="liked"
		>
			<Suspense
				fallback={Array.from({ length: 4 }).map((_, i) => (
					<Skeleton className="col-span-1 row-span-1" key={`LikedPuzzles__${i}`}>
						<PuzzleSummaryCard
							className="invisible"
							puzzle={{
								id: "",
								difficulty: "Easy",
								max_attempts: 0,
								num_of_likes: 0,
								created_at: new Date(),

								created_by: {
									id: "",
									state: "COMPLETE",
									username: "",
									created_at: new Date(),
								},
							}}
						/>
					</Skeleton>
				))}
			>
				<Await resolve={data.liked}>
					{(liked) => (
						<>
							{liked.success &&
								liked.data.edges.map((edge) => (
									<div className="col-span-1 row-span-1" key={edge.node.id}>
										<PuzzleSummaryCard puzzle={hydratePuzzleSummary(edge.node)} />
									</div>
								))}
						</>
					)}
				</Await>
			</Suspense>
		</TabsContent>
	);
}
