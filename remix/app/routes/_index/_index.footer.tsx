import { Link, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { useGameContext } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import { setSearchParams } from "@/lib/set-search-params";

import type { loader } from "./route";

export function IndexFooter() {
	const data = useLoaderData<typeof loader>();

	const [state] = useGameContext();

	const navigation = useNavigation();
	const [searchParams] = useSearchParams();

	const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";

	return (
		<>
			<div
				className={cn(
					"grid w-full grid-cols-4 gap-1 transition-opacity",

					"data-[is-loading='true']:animate-pulse",
				)}
				data-is-loading={isLoading}
			>
				<div className="col-span-4 flex h-full gap-1">
					<Link
						aria-disabled={isLoading}
						className={cn(
							"h-full w-full basis-1/2",

							"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
						)}
						preventScrollReset
						tabIndex={-1}
						to={{
							search: "",
						}}
						viewTransition
					>
						<Button
							aria-label="Go to latest puzzles"
							className={cn(
								"w-full",

								"data-[is-loading='true']:disabled:opacity-100",
							)}
							data-is-loading={isLoading}
							disabled={isLoading || !searchParams.has("cursor")}
							size="lg"
							variant="ghost"
						>
							<RotateCcwIcon className="h-4 w-4" />

							<div className="ml-2">Go to latest</div>
						</Button>
					</Link>

					<div className="flex h-full w-full basis-1/2 items-center gap-1">
						<Link
							aria-disabled={!data.pageInfo.has_previous_page || isLoading}
							className={cn(
								"h-full w-full",

								"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
							)}
							preventScrollReset
							tabIndex={-1}
							to={{
								search: setSearchParams(searchParams, {
									cursor: data.pageInfo.previous_cursor ?? undefined,
									direction: "B",
								}),
							}}
							viewTransition
						>
							<Button
								aria-label="Go to previous game"
								className={cn(
									"w-full",

									"data-[is-loading='true']:disabled:opacity-100",
								)}
								data-is-loading={isLoading}
								disabled={!data.pageInfo.has_previous_page || isLoading}
								size="lg"
								variant="outline"
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</Button>
						</Link>

						<Link
							aria-disabled={!data.pageInfo.has_next_page || isLoading}
							className={cn(
								"h-full w-full",

								"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
							)}
							preventScrollReset
							tabIndex={-1}
							to={{
								search: setSearchParams(searchParams, {
									cursor: data.pageInfo.next_cursor ?? undefined,
									direction: "F",
								}),
							}}
							viewTransition
						>
							<Button
								aria-label="Go to next game"
								className={cn(
									"w-full",

									"data-[is-loading='true']:disabled:opacity-100",
								)}
								data-is-loading={isLoading}
								disabled={!data.pageInfo.has_next_page || isLoading}
								size="lg"
								variant="outline"
							>
								<ChevronRightIcon className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className="flex gap-1">
				<div className="w-full min-w-0 basis-1/2">
					{isLoading ? (
						<Skeleton className="mt-2 inline-flex min-w-0 select-none items-center px-2 py-1 text-transparent">
							<p className="w-full truncate text-lg font-bold leading-none">EASY</p>
						</Skeleton>
					) : (
						<div
							className={cn(
								"mt-2 inline-flex min-w-0 items-center px-2 py-1",

								"data-[difficulty='EASY']:animate-none data-[difficulty='EASY']:bg-secondary data-[difficulty='EASY']:text-secondary-foreground",
								"data-[difficulty='HARD']:animate-none data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
								"data-[difficulty='MEDIUM']animate-none data-[difficulty='MEDIUM']:bg-primary data-[difficulty='MEDIUM']:text-primary-foreground",
							)}
							data-difficulty={state.game.puzzle.difficulty}
						>
							<p className="w-full truncate text-lg font-bold leading-none">
								{state.game.puzzle.difficulty}
							</p>
						</div>
					)}
				</div>

				<div className="w-full min-w-0 basis-1/2 ">
					<div className="flex h-full w-full flex-col items-end justify-center text-end">
						{isLoading ? (
							<div className="mt-2 min-w-0">
								<Skeleton className="w-auto text-transparent">
									<p className="w-full text-lg font-bold leading-none">Username</p>
								</Skeleton>
							</div>
						) : (
							<Link
								className={cn(
									"mt-2 min-w-0 no-underline outline-none ring-offset-background transition-all",

									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								)}
								to={`/users/${state.game.puzzle.created_by.id}`}
							>
								<p className="w-full truncate text-lg font-bold leading-none">
									{state.game.puzzle.created_by.username}
								</p>
							</Link>
						)}

						{isLoading ? (
							<Skeleton className="text-transparent">
								<p className="text-xs">{dayjs().format("MMMM DD, YYYY")}</p>
							</Skeleton>
						) : (
							<time
								className="text-xs text-muted-foreground"
								dateTime={dayjs(state.game.puzzle.created_at).toISOString()}
							>
								{dayjs(state.game.puzzle.created_at).format("MMMM DD, YYYY")}
							</time>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
