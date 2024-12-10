import { Link, useFetcher, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { useGameContext } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import { setSearchParams } from "@/lib/set-search-params";

import type { loader } from "./route";

// TODO: Replace links with forms to allow us to save the game state before the next puzzle loads
export function IndexFooter() {
	const loaderData = useLoaderData<typeof loader>();

	const navigation = useNavigation();
	const [searchParams] = useSearchParams();

	const fetcher = useFetcher({
		key: `games.upsert.${loaderData.puzzle.id}`,
	});

	const [state] = useGameContext();

	const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";
	const isSaving = fetcher.state === "submitting";

	return (
		<>
			<div className="grid w-full grid-cols-4 gap-1 transition-opacity">
				<div className="col-span-4 grid h-full grid-cols-4 gap-1">
					<Link
						aria-disabled={isLoading || isSaving || !searchParams.get("cursor")}
						className={cn(
							"col-span-2 h-full w-full",

							"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
						)}
						preventScrollReset
						tabIndex={-1}
						to={{
							search: "",
						}}
					>
						<Button
							aria-label="Go to latest puzzles"
							className="w-full"
							disabled={isLoading || isSaving || !searchParams.has("cursor")}
							size="lg"
							variant="ghost"
						>
							<RotateCcwIcon className="h-4 w-4" />

							<div className="ml-2">Go to latest</div>
						</Button>
					</Link>

					<div className="col-span-2 flex h-full w-full items-center gap-1">
						<Link
							aria-disabled={isLoading || isSaving || !loaderData.pageInfo.has_previous_page}
							className={cn(
								"h-full w-full min-w-0",

								"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
							)}
							preventScrollReset
							tabIndex={-1}
							to={{
								search: setSearchParams(searchParams, {
									cursor: loaderData.pageInfo.previous_cursor ?? undefined,
									direction: "B",
								}),
							}}
						>
							<Button
								aria-label="Go to previous game"
								className="w-full rounded-xl border bg-card"
								disabled={isLoading || isSaving || !loaderData.pageInfo.has_previous_page}
								size="lg"
								variant="ghost"
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</Button>
						</Link>

						<Link
							aria-disabled={isLoading || isSaving || !loaderData.pageInfo.has_next_page}
							className={cn(
								"h-full w-full min-w-0",

								"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
							)}
							preventScrollReset
							tabIndex={-1}
							to={{
								search: setSearchParams(searchParams, {
									cursor: loaderData.pageInfo.next_cursor ?? undefined,
									direction: "F",
								}),
							}}
						>
							<Button
								aria-label="Go to next game"
								className="w-full rounded-xl border bg-card"
								disabled={isLoading || isSaving || !loaderData.pageInfo.has_next_page}
								size="lg"
								variant="ghost"
							>
								<ChevronRightIcon className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className="mt-2 flex gap-1">
				<div className="flex w-full min-w-0 basis-1/2 items-center">
					{isLoading ? (
						<Skeleton className="inline-flex min-w-0 select-none items-center px-1 py-0.5">
							<p className="invisible w-full truncate text-sm font-semibold">EASY</p>
						</Skeleton>
					) : (
						<div
							className={cn(
								"inline-flex min-w-0 items-center px-1 py-0.5",

								"data-[difficulty='EASY']:bg-success data-[difficulty='EASY']:text-success-foreground data-[difficulty='EASY']:animate-none",
								"data-[difficulty='HARD']:animate-none data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
								"data-[difficulty='MEDIUM']animate-none data-[difficulty='MEDIUM']:bg-warning data-[difficulty='MEDIUM']:text-warning-foreground",
							)}
							data-difficulty={state.puzzle.difficulty}
						>
							<p className="w-full truncate text-sm font-semibold">{state.puzzle.difficulty}</p>
						</div>
					)}
				</div>

				<div className="w-full min-w-0 basis-1/2 ">
					<div className="flex h-full w-full flex-col items-end justify-center text-end">
						{isLoading ? (
							<div className="min-w-0">
								<Skeleton className="w-auto text-transparent">
									<p className="invisible w-full">Username</p>
								</Skeleton>
							</div>
						) : (
							<Link
								className={cn(
									"w-full min-w-0 no-underline outline-none ring-offset-background transition-all",

									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								)}
								to={
									loaderData.me && state.puzzle.created_by.id === loaderData.me.id
										? "/profile/created/"
										: `/users/${state.puzzle.created_by.id}/created/`
								}
							>
								<p className="w-full truncate">{state.puzzle.created_by.username}</p>
							</Link>
						)}

						{isLoading ? (
							<Skeleton>
								<p className="invisible text-xs font-medium">{dayjs().format("MMMM DD, YYYY")}</p>
							</Skeleton>
						) : (
							<time
								className="text-xs font-medium text-muted-foreground"
								dateTime={dayjs(state.puzzle.created_at).toISOString()}
							>
								{dayjs(state.puzzle.created_at).format("MMMM DD, YYYY")}
							</time>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
