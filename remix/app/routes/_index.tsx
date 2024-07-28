import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Flag, Heart, RotateCcw, Shuffle, User } from "lucide-react";

import { Button } from "@/components/button";
import { Grid, GridBlock, GridBlocks, GridGroup, GridMenu } from "@/components/grid";
import { Header } from "@/components/header";
import { GameProvider, useGame } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import { hydrateGame } from "@/lib/hydrate-game";
import type { Game } from "@/types/game";
import type { Puzzle } from "@/types/puzzle";

export async function loader() {
	const puzzle: Puzzle = {
		id: "91fc7014-016c-4068-85f4-4f274bd51570",
		difficulty: "Easy",
		max_attempts: 3,
		num_of_likes: 0,
		created_at: new Date(),
		groups: [
			{
				id: "5e4c7397-fb77-4d92-923a-3cb9ea8c12d8",
				blocks: [
					{
						id: "619b8716-b36d-46a5-9b8d-876679021a81",
						group_id: "5e4c7397-fb77-4d92-923a-3cb9ea8c12d8",
						value: "SNAP",
					},
					{
						id: "4696f4a7-2290-4039-ac41-12e6f5cd9c67",
						group_id: "5e4c7397-fb77-4d92-923a-3cb9ea8c12d8",
						value: "CLAP",
					},
					{
						id: "08ceab5e-8392-401d-9c67-eefef19725ba",
						group_id: "5e4c7397-fb77-4d92-923a-3cb9ea8c12d8",
						value: "BOB",
					},
					{
						id: "6da27eac-237f-4d9a-b621-65b8d1038028",
						group_id: "5e4c7397-fb77-4d92-923a-3cb9ea8c12d8",
						value: "TAP",
					},
				],
				description: "Keep rhythm with music",
			},
			{
				id: "e8d69f3b-1190-49e4-a632-355ef47a758d",
				blocks: [
					{
						id: "f73e5412-b721-4d85-9cc7-43f5df6b9994",
						group_id: "e8d69f3b-1190-49e4-a632-355ef47a758d",
						value: "WRAP",
					},
					{
						id: "7ca490d6-eb9b-4d3c-89e1-4134ccb36e21",
						group_id: "e8d69f3b-1190-49e4-a632-355ef47a758d",
						value: "BUN",
					},
					{
						id: "86c87a4e-88a8-41d7-b872-3865ca7986d7",
						group_id: "e8d69f3b-1190-49e4-a632-355ef47a758d",
						value: "HERO",
					},
					{
						id: "fc8478c8-2168-438d-88df-f4a19e3b6a33",
						group_id: "e8d69f3b-1190-49e4-a632-355ef47a758d",
						value: "ROLL",
					},
				],
				description: "Deli bread options",
			},
			{
				id: "9f1edee0-f8d7-4a7b-a8f8-0a963f23df8f",
				blocks: [
					{
						id: "6b6e6320-3ea0-40ce-8b74-3d74f26438c4",
						group_id: "9f1edee0-f8d7-4a7b-a8f8-0a963f23df8f",
						value: "FUNDING",
					},
					{
						id: "ab6f1de8-263c-483b-aab1-ef608c63e8eb",
						group_id: "9f1edee0-f8d7-4a7b-a8f8-0a963f23df8f",
						value: "GOLF",
					},
					{
						id: "43b9e1ee-6b86-404c-bcdc-d62844d9c7fd",
						group_id: "9f1edee0-f8d7-4a7b-a8f8-0a963f23df8f",
						value: "DRINKS",
					},
					{
						id: "d02010df-60fe-4077-ae7a-c29ad811b7ad",
						group_id: "9f1edee0-f8d7-4a7b-a8f8-0a963f23df8f",
						value: "APPLAUSE",
					},
				],
				description: "Round of _____",
			},
			{
				id: "d117cb32-3330-4e9e-af7c-d9a1c8a55e80",
				blocks: [
					{
						id: "e9c835aa-0bf2-4df3-9dab-11c4a75cb9ba",
						group_id: "d117cb32-3330-4e9e-af7c-d9a1c8a55e80",
						value: "TRAP",
					},
					{
						id: "3952bc87-c79b-498a-b076-bba13964038f",
						group_id: "d117cb32-3330-4e9e-af7c-d9a1c8a55e80",
						value: "YAP",
					},
					{
						id: "38982c9c-cd84-403d-be2a-e3b35a40e094",
						group_id: "d117cb32-3330-4e9e-af7c-d9a1c8a55e80",
						value: "CHOPS",
					},
					{
						id: "0fdee481-2540-47f1-a71d-eb94833a2c9a",
						group_id: "d117cb32-3330-4e9e-af7c-d9a1c8a55e80",
						value: "KISSER",
					},
				],
				description: "Slang for mouth",
			},
		],

		created_by: {
			id: "33363900-42eb-4431-bbaf-d82b608e4348",
			state: "COMPLETE",
			username: "JohnDoe",
			created_at: new Date(),
		},
	};

	const game: Game = {
		id: "0906bdfc-ad75-4ab2-be49-60c6ae0c8b90",
		attempts: [],
		challenge_code: "",
		correct: [],
		puzzle,
		score: 0,

		created_at: new Date(),
	};

	return json<Game>(game);
}

export default function Index() {
	const data = useLoaderData<typeof loader>();
	const ctx = useGame({
		game: hydrateGame(data),
	});
	const [
		{ blocks, game, isGameOver, isWinnerWinnerChickenDinner, isWrong, selected, wrongAttempts },
		{ onBlockSelect, onShuffle },
	] = ctx;

	return (
		<>
			<Header />

			<main className="mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-5">
				<div className="flex h-full w-full max-w-3xl flex-col gap-1">
					<div
						className={cn(
							"grid w-full grid-cols-4 gap-1 transition-opacity",

							"max-md:grid-rows-2",
						)}
					>
						<div
							className={cn(
								"col-span-1",

								"data-[is-game-over='true']:opacity-50",
								"max-md:col-span-4 max-md:row-start-2",
								"md:col-start-1",
							)}
							data-is-game-over={isGameOver || isWinnerWinnerChickenDinner}
						>
							<div className="flex w-full items-center justify-between border bg-muted px-4 py-2">
								<div className="flex flex-col items-start justify-end">
									<h3 className="text-sm font-medium tracking-tight">Attempts Left</h3>

									<div className="mt-2 text-2xl font-bold leading-none">
										{data.puzzle.max_attempts - wrongAttempts}
									</div>

									<div className="text-xs text-muted-foreground">
										out of {data.puzzle.max_attempts}
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

								"max-md:col-span-2 max-md:col-start-3 max-md:row-start-1",
							)}
						>
							<Button
								aria-label="Give up"
								className="h-full w-full gap-2"
								disabled={isGameOver || isWinnerWinnerChickenDinner}
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
								className="h-full w-full gap-2"
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
								"max-md:col-span-2 max-md:col-start-1 max-md:row-start-1",
								"md:col-start-4",
							)}
							data-is-game-over={isGameOver || isWinnerWinnerChickenDinner}
						>
							<div className="flex h-full w-full items-center justify-between border bg-muted px-4 py-2">
								<div className="flex flex-col items-start justify-end">
									<h3 className="text-sm font-medium tracking-tight">Created By</h3>

									<div className="mt-2 text-lg font-bold leading-none">
										{data.puzzle.created_by.username}
									</div>

									<div className="text-xs text-muted-foreground">
										{dayjs(data.puzzle.created_at).format("MMM D, YYYY")}
									</div>
								</div>

								<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary">
									<User className="h-4 w-4" />
								</div>
							</div>
						</div>
					</div>

					<GameProvider value={ctx}>
						<Grid>
							<GridBlocks>
								{/* Render correct group first */}
								{game.correct.map((group_id) => {
									const group = data.puzzle.groups.find((g) => g.id === group_id);
									if (!group) {
										return null;
									}

									return <GridGroup key={group.id}>{group.description}</GridGroup>;
								})}

								{/* Render rest of blocks */}
								{blocks.map((block) => {
									const isCorrect = game.correct.includes(block.group_id);
									const isSelected = selected.findIndex((b) => b.id === block.id) !== -1;

									if (isCorrect) {
										return null;
									}

									return (
										<GridBlock
											disabled={isGameOver || isWinnerWinnerChickenDinner}
											hasCorrect={game.correct.length > 0}
											isError={isSelected && isWrong}
											isSelected={isSelected && !isWrong}
											key={`${block.group_id}-${block.value}`}
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
							<Button
								aria-label="Go to latest puzzles"
								className="basis-1/2"
								size="lg"
								variant="ghost"
							>
								<RotateCcw className="h-4 w-4" />

								<div className="ml-2">Go to latest</div>
							</Button>

							<div className="flex h-full w-full basis-1/2 items-center gap-1">
								<Button
									aria-label="Go to previous game"
									className="h-full w-full"
									size="lg"
									variant="outline"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>

								<Button
									aria-label="Go to next game"
									className="h-full w-full"
									size="lg"
									variant="outline"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
