import { useMemo } from "react";

import type { LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Flag, Heart, RotateCcw, Shuffle, Star } from "lucide-react";

import { Button } from "@/components/button";
import { Grid, GridBlock, GridBlocks, GridGroup, GridMenu } from "@/components/grid";
import { Header } from "@/components/header";
import { GameProvider, useGame } from "@/hooks/use-game";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { cn } from "@/lib/cn";
import { createGame } from "@/lib/create-game";
import { hydrateGame } from "@/lib/hydrate-game";
import { hydrateUser } from "@/lib/hydrate-user";
import { isNumber } from "@/lib/is-number";
import { API } from "@/services/api.server";
import type { Game } from "@/types/game";
import type { User } from "@/types/user";

// Exptected response from the loader
type LoaderResponse = {
	game: Game;
	me?: User;
	pageInfo: {
		current: number;
		cursor: string;
		length: number;
	};
};

// TODO: Pull from some sort of storage to check if the user has an active game
export async function loader({
	request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderResponse>> {
	const [me, puzzles] = await Promise.all([API.me(request), API.puzzles.recent(request)]);

	// TODO: Render proper error page
	if (!puzzles.success || !puzzles.data) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 500 });
	}

	// TODO: Render proper error page
	const firstPuzzle = puzzles.data.edges[0]?.node;
	if (!firstPuzzle) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 500 });
	}

	const { searchParams } = new URL(request.url);

	const cursor = searchParams.get("cursor");

	const currentParam = searchParams.get("current");
	const current = isNumber(currentParam) ? Number(currentParam) : 0;
	if (
		!currentParam ||
		currentParam === "" ||
		current < 0 ||
		current > puzzles.payload.edges.length - 1
	) {
		return json({
			game: createGame({
				me: me.data?.user,
				puzzle: firstPuzzle,
			}),
			me: me.data?.user,
			pageInfo: {
				cursor: cursor ?? "",
				length: puzzles.data.edges.length,
				next: puzzles.data.edges[1]?.node.id,
			},
		});
	}

	const edge = puzzles.data.edges.find((e) => e.node.id === current);
	const edgeIndex = puzzles.data.edges.findIndex((e) => e.node.id === current);
	// If current is not on the page, then, redirect to remove it from the URL
	if (!edge) {
		return redirect(cursor ? `/?cursor=${cursor}` : "/");
	}

	return json({
		game: createGame({
			me: me.data?.user,
			puzzle: edge.node,
		}),
		me: me.data?.user,
		pageInfo: {
			current,
			cursor: cursor ?? "",
			length: puzzles.data.edges.length,
			next: puzzles.data.edges?.[edgeIndex + 1]?.node.id,
			previous: puzzles.data.edges?.[edgeIndex - 1]?.node.id,
		},
	});
}

// TODO: Create different view depending on the result of the loader
export default function Index() {
	const data = useLoaderData<LoaderResponse>();

	// Setup game context
	const ctx = useGame({
		game: hydrateGame(data.game),
	});
	const [
		{ blocks, game, isGameOver, isWinnerWinnerChickenDinner, isWrong, selected, wrongAttempts },
		{ onBlockSelect, onGiveUp, onShuffle },
	] = ctx;

	// Check if the component is mounted
	const isMounted = useIsMounted();

	// Hydrate currently authenticated user to pass to the header component
	const me = useMemo<undefined | User>(
		() => (data.me ? hydrateUser(data.me) : undefined),
		[data.me],
	);

	// Pagination helpers
	const hasNextPage = data.pageInfo.current < data.pageInfo.length - 1;
	const hasPreviousPage = data.pageInfo.current > 0;
	const isLatest = data.pageInfo.cursor === "";

	return (
		<>
			<Header me={me} />

			<main
				className={cn(
					"mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-2",

					"max-lg:min-h-[700px]",
				)}
			>
				<div className="flex h-full w-full max-w-3xl flex-col gap-1">
					<div className="grid w-full grid-cols-4 gap-1 transition-opacity">
						<div
							className={cn(
								"col-span-1",

								"data-[is-game-over='true']:opacity-50",
								"max-md:col-span-2 max-md:row-start-1",
								"md:col-start-1",
							)}
							data-is-game-over={isGameOver || isWinnerWinnerChickenDinner}
						>
							<div className="flex w-full items-center justify-between border bg-muted px-4 py-2">
								<div className="flex flex-col items-start justify-end">
									<h3 className="text-sm font-medium tracking-tight">Attempts Left</h3>

									<div className="mt-2 text-2xl font-bold leading-none">
										{game.puzzle.max_attempts - wrongAttempts}
									</div>

									<div className="text-xs text-muted-foreground">
										out of {game.puzzle.max_attempts}
									</div>
								</div>

								<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary">
									<Heart className="h-4 w-4" />
								</div>
							</div>
						</div>

						<div
							className={cn(
								"col-span-1 flex h-full w-full flex-col gap-1",

								"max-md:col-span-4 max-md:h-auto max-md:flex-row",
							)}
						>
							<Button
								aria-label="Give up"
								className={cn(
									"h-full w-full gap-2",

									"max-md:h-11 max-md:basis-1/2",
								)}
								disabled={isGameOver || isWinnerWinnerChickenDinner}
								onClick={onGiveUp}
								variant="outline"
							>
								<Flag className="h-3 w-3" />
								<div>Give up</div>

								<kbd className="pointer-events-none whitespace-nowrap rounded border border-b-[3px] border-primary/40 bg-primary/10 px-1.5 font-mono text-[0.8em] font-bold leading-normal text-primary">
									[
								</kbd>
							</Button>

							<Button
								aria-label="Shuffle"
								className={cn(
									"h-full w-full gap-2",

									"max-md:h-11 max-md:basis-1/2",
								)}
								disabled={isGameOver || isWinnerWinnerChickenDinner}
								onClick={onShuffle}
								variant="outline"
							>
								<Shuffle className="h-3 w-3" />

								<div>Shuffle</div>

								<kbd className="pointer-events-none whitespace-nowrap rounded border border-b-[3px] border-primary/40 bg-primary/10 px-1.5 font-mono text-[0.8em] font-bold leading-normal text-primary">
									]
								</kbd>
							</Button>
						</div>

						<div
							className={cn(
								"col-span-1",

								"data-[is-game-over='true']:opacity-50",
								"max-md:col-span-2 max-md:col-start-3 max-md:row-start-1",
								"md:col-start-4",
							)}
							data-is-game-over={isGameOver || isWinnerWinnerChickenDinner}
						>
							<div className="flex h-full w-full items-center justify-between border bg-muted px-4 py-2">
								<div className="flex flex-col items-start justify-end">
									<h3 className="text-sm font-medium tracking-tight">Likes</h3>

									<div className="line-clamp-2 text-lg font-bold leading-none">
										{game.puzzle.num_of_likes}
									</div>
								</div>

								<Button
									className={cn(
										"border border-primary bg-primary/10 text-primary",

										"data-[is-liked=true]:text-primary",
										"hover:enabled:bg-primary/20",
										"[&>svg]:data-[is-liked=true]:fill-current",
									)}
									data-is-liked={!!game.puzzle.liked_at}
									size="icon"
								>
									<Star className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<GameProvider value={ctx}>
						<Grid>
							<GridBlocks>
								{/* Render correct group first */}
								{game.correct.map((group_id) => {
									const group = game.puzzle.groups.find((g) => g.id === group_id);
									if (!group) {
										return null;
									}

									return <GridGroup key={group.id}>{group.description}</GridGroup>;
								})}

								{/* Render rest of blocks */}
								{blocks.map((block) => {
									const isCorrect = game.correct.includes(block.puzzle_group_id);
									const isSelected = selected.findIndex((b) => b.id === block.id) !== -1;

									if (isCorrect) {
										return null;
									}

									return (
										<GridBlock
											disabled={isGameOver || !isMounted() || isWinnerWinnerChickenDinner}
											hasCorrect={game.correct.length > 0}
											isError={isSelected && isWrong}
											isSelected={isSelected && !isWrong}
											key={`${block.puzzle_group_id}-${block.value}`}
											onClick={() => onBlockSelect(block)}
										>
											{block.value}
										</GridBlock>
									);
								})}
							</GridBlocks>

							{(isGameOver || isWinnerWinnerChickenDinner) && (
								<GridMenu blocks={blocks} game={game} isSuccess={isWinnerWinnerChickenDinner} />
							)}
						</Grid>
					</GameProvider>

					<div className="grid w-full grid-cols-4 gap-1 transition-opacity">
						<div className="col-span-4 flex h-full gap-1">
							<Link
								aria-disabled={isLatest}
								className={cn(
									"h-full w-full basis-1/2",

									"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
								)}
								reloadDocument
								tabIndex={-1}
								to={{
									search: "",
								}}
							>
								<Button
									aria-label="Go to latest puzzles"
									className="w-full"
									disabled={isLatest}
									size="lg"
									variant="ghost"
								>
									<RotateCcw className="h-4 w-4" />

									<div className="ml-2">Go to latest</div>
								</Button>
							</Link>

							<div className="flex h-full w-full basis-1/2 items-center gap-1">
								<Link
									aria-disabled={!hasPreviousPage}
									className={cn(
										"h-full w-full",

										"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
									)}
									reloadDocument
									tabIndex={-1}
									to={{
										search: `?current=${hasPreviousPage ? data.pageInfo.current - 1 : 0}`,
									}}
								>
									<Button
										aria-label="Go to previous game"
										className="h-full w-full"
										disabled={!hasPreviousPage}
										size="lg"
										variant="outline"
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
								</Link>

								<Link
									aria-disabled={!hasNextPage}
									className={cn(
										"h-full w-full",

										"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
									)}
									reloadDocument
									tabIndex={-1}
									to={{
										search: `?current=${hasNextPage ? data.pageInfo.current + 1 : data.pageInfo.current}`,
									}}
								>
									<Button
										aria-label="Go to next game"
										className="h-full w-full"
										disabled={!hasNextPage}
										size="lg"
										variant="outline"
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</Link>
							</div>
						</div>
					</div>

					<div className="flex gap-1">
						<div className="w-full min-w-0 basis-1/2">
							<h3 className="text-sm font-medium tracking-tight">Difficulty</h3>

							<div
								className={cn(
									"mt-2 inline-flex min-w-0 items-center px-2 py-1",

									"data-[difficulty='EASY']:bg-secondary data-[difficulty='EASY']:text-secondary-foreground",
									"data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
									"data-[difficulty='MEDIUM']:bg-primary data-[difficulty='MEDIUM']:text-primary-foreground",
								)}
								data-difficulty={game.puzzle.difficulty}
							>
								<p className="w-full truncate text-lg font-bold leading-none">
									{game.puzzle.difficulty}
								</p>
							</div>
						</div>

						<div className="w-full min-w-0 basis-1/2 ">
							<div className="flex h-full w-full flex-col items-end justify-center text-end">
								<h3 className="text-sm font-medium tracking-tight">Created By</h3>

								<Link
									className={cn(
										"mt-2 w-full min-w-0 no-underline outline-none ring-offset-background transition-all",

										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									)}
									to={`/users/${game.puzzle.created_by.id}`}
								>
									<p className="w-full truncate text-lg font-bold leading-none">
										{game.puzzle.created_by.username}
									</p>
								</Link>

								<time
									className="text-xs text-muted-foreground"
									dateTime={dayjs(game.puzzle.created_at).toISOString()}
								>
									{dayjs(game.puzzle.created_at).format("MMMM DD, YYYY")}
								</time>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
