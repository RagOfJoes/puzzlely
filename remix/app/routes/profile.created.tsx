import { Suspense } from "react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer, redirect } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";

import { PuzzleSummaryCard } from "@/components/puzzle-summary-card";
import { Skeleton } from "@/components/skeleton";
import { TabsContent } from "@/components/tabs";
import { cn } from "@/lib/cn";
import { hydratePuzzleSummary } from "@/lib/hydrate-puzzle-summary";
import { API } from "@/services/api.server";
import { getSession } from "@/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	if (!session.get("user")) {
		return redirect("/login");
	}

	const created = API.puzzles.created(request, session.get("user")?.id ?? "");

	return defer({
		created,
	});
}

export default function ProfileCreated() {
	const data = useLoaderData<typeof loader>();

	return (
		<TabsContent
			aria-label="Created puzzles"
			className={cn(
				"grid w-full grid-cols-2 gap-1",

				"max-md:grid-cols-1",
			)}
			value="created"
		>
			<Suspense
				fallback={Array.from({ length: 4 }).map((_, i) => (
					<Skeleton className="col-span-1 row-span-1" key={`CreatedPuzzles__${i}`}>
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
				<Await resolve={data.created}>
					{(created) => (
						<>
							{created.success &&
								created.data.edges.map((edge) => (
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
