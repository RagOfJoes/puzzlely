import { Suspense } from "react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
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
		<Suspense fallback={<h1>Loading...</h1>}>
			<Await resolve={data.liked}>
				{(liked) => (
					<TabsContent
						aria-label="Liked puzzles"
						className={cn(
							"grid w-full grid-cols-2 gap-1",

							"max-md:grid-cols-1",
						)}
						value="liked"
					>
						{liked.success &&
							liked.data.edges.map((edge) => (
								<div className="col-span-1 row-span-1" key={edge.node.id}>
									<PuzzleSummaryCard puzzle={hydratePuzzleSummary(edge.node)} />
								</div>
							))}
					</TabsContent>
				)}
			</Await>
		</Suspense>
	);
}
