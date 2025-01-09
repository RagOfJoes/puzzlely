import { useCallback, useEffect, useState } from "react";

import { useKey } from "@rwh/react-keystrokes";
import shuffle from "lodash.shuffle";

import { useGameLocalContext } from "@/hooks/use-game-local";
import { arePuzzleBlocksSameGroup } from "@/lib/are-puzzle-blocks-same-group";
import { createContext } from "@/lib/create-context";
import { getPuzzleBlocksFromAttempts } from "@/lib/get-puzzle-blocks-from-attempts";
import { groupBy } from "@/lib/group-by";
import { pickLatestGame } from "@/lib/pick-latest-game";
import { uniqueBy } from "@/lib/unique-by";
import type { GamePayload } from "@/types/game-payload";
import type { Puzzle, PuzzleBlock } from "@/types/puzzle";

export type UseGameProps = {
	game?: GamePayload;
	puzzle: Puzzle;
};

export type UseGame = [
	state: {
		// Blocks that will be rendered
		blocks: PuzzleBlock[];
		// Existing/current game state
		game: GamePayload;
		// Flag to determine if the game is over. Will be triggered if the user has reached the maximum number of attempts
		isGameOver: boolean;
		// Flag to determine if the game is still loading
		isLoading: boolean;
		// Flag to determine if the user has won the game
		isWinnerWinnerChickenDinner: boolean;
		// Flag to determine if the elements inside the `selected` state are wrong
		isWrong: boolean;
		// Puzzle this game is for
		puzzle: Puzzle;
		// List of elements that stores the user's currently selected blocks
		selected: PuzzleBlock[];
		// Number of wrong attempts
		wrongAttempts: number;
	},
	actions: {
		// When the user selects a block
		// NOTE: A majority of the game logic is handled here
		onBlockSelect: (block: PuzzleBlock) => void;
		// When the user either presses the give up key or clicks the give up button
		onGiveUp: () => void;
		// When the user either presses the shuffle key or clicks the shuffle button
		onShuffle: () => void;
	},
];

export const [GameProvider, useGameContext] = createContext<UseGame>({
	hookName: "useGameContext",
	name: "Game",
	providerName: "GameProvider",
});

export function useGame(props: UseGameProps): UseGame {
	const [local] = useGameLocalContext();

	/**
	 * Game state
	 */

	const [blocks, setBlocks] = useState<UseGame[0]["blocks"]>([]);
	const [game, setGame] = useState<UseGame[0]["game"]>(() => {
		if (!props.game) {
			return {
				attempts: [],
				correct: [],
				score: 0,
			};
		}

		return props.game;
	});
	const [puzzle, setPuzzle] = useState<UseGame[0]["puzzle"]>(props.puzzle);
	const [selected, setSelected] = useState<UseGame[0]["selected"]>([]);
	const [wrongAttempts, setWrongAttempts] = useState<UseGame[0]["wrongAttempts"]>(0);

	/**
	 * Flags
	 */

	const isGivenUp = useKey("[");
	const isShuffle = useKey("]");

	const [isGameOver, toggleIsGameOver] = useState<UseGame[0]["isGameOver"]>(false);
	const [isLoading, toggleIsLoading] = useState<UseGame[0]["isLoading"]>(true);
	const [isWinnerWinnerChickenDinner, toggleIsWinnerWinnerChickenDinner] =
		useState<UseGame[0]["isWinnerWinnerChickenDinner"]>(false);
	const [isWrong, toggleIsWrong] = useState<UseGame[0]["isWrong"]>(false);

	/**
	 * Actions
	 */

	const onBlockSelect: UseGame[1]["onBlockSelect"] = useCallback(
		(block: PuzzleBlock) => {
			const isAlreadyInCorrect = game.correct.includes(block.puzzle_group_id);
			const isComplete = !!game.completed_at;
			const isTooMuchAttempts = puzzle.max_attempts > 0 && wrongAttempts >= puzzle.max_attempts;
			const isTooMuchSelected = selected.length >= 4;

			if (isAlreadyInCorrect || isComplete || isTooMuchAttempts || isTooMuchSelected || isWrong) {
				return;
			}

			// If already selected then filter out of `selected` state
			const isSelected = selected.findIndex((b) => b.id === block.id) !== -1;
			if (isSelected) {
				setSelected((prev) => prev.filter((b) => b.id !== block.id));
				return;
			}

			// Clone `selected` then append Block to it
			const newSelected = [...selected, block];
			// Update `selected` state to trigger animation
			setSelected(newSelected);

			// If `selected` state isn't full yet then exit
			if (newSelected.length < 4) {
				return;
			}

			// Append `selected` state's IDs to Game's `attempts` field
			const newAttempts = [...game.attempts, newSelected.map((select) => select.id)];

			// If any of the Blocks are wrong
			if (newSelected.some((select) => select.puzzle_group_id !== block.puzzle_group_id)) {
				// Check if reached `maxAttempts`
				const isMaxAttempt = wrongAttempts + 1 >= puzzle.max_attempts;

				setGame((prev) => ({
					...prev,
					attempts: newAttempts,

					completed_at: isMaxAttempt ? new Date() : null,
				}));
				setWrongAttempts((prev) => prev + 1);

				// Toggle `wrong` state to true to trigger animation
				toggleIsWrong(true);

				// If reached `maxAttempts`, then, toggle `isGameOver` state to true`
				if (isMaxAttempt) {
					toggleIsGameOver(true);
				}

				return;
			}

			// Clone `correct` state then append `groupID`
			const newCorrect = [...game.correct, block.puzzle_group_id];

			// If User has linked all Groups correctly
			const isGuessedAll = newCorrect.length === puzzle.groups.length - 1;
			if (isGuessedAll) {
				// Append last `group_id` to cloned `correct` state
				const lastGroup = puzzle.groups.filter((g) => !newCorrect.includes(g.id)).map((g) => g.id);

				// Make sure there's only one group left also make typescript happy
				if (lastGroup.length === 1 && typeof lastGroup[0] === "string") {
					newAttempts.push(
						blocks.filter((b) => b.puzzle_group_id === lastGroup[0]).map((b) => b.id),
					);
					newCorrect.push(lastGroup[0]);
				}
			}

			// 1. Filter blocks so only blocks that belong to a correct group is returned
			// 2. Group by `groupID`
			// 3. Flatten array
			const grouped = groupBy(
				blocks.filter((b) => newCorrect.includes(b.puzzle_group_id)),
				(b) => b.puzzle_group_id,
			).flat();

			// 1. Order blocks by putting correctly guessed on top
			// 2. Remove duplicates
			const newBlocks = uniqueBy([...grouped, ...blocks], (item) => item.id);

			const newScore = isGuessedAll ? puzzle.groups.length : game.score + 1;

			// Update game state
			setGame((prev) => ({
				...prev,
				attempts: newAttempts,
				correct: newCorrect,
				score: newScore,

				completed_at: isGuessedAll ? new Date() : null,
			}));

			// Update block states
			setSelected([]);
			setBlocks(newBlocks);

			if (isGuessedAll) {
				toggleIsWinnerWinnerChickenDinner(true);
			}
		},
		[
			blocks,
			game.attempts,
			game.completed_at,
			game.correct,
			game.score,
			isWrong,
			puzzle.groups,
			puzzle.max_attempts,
			selected,
			wrongAttempts,
		],
	);

	const onGiveUp: UseGame[1]["onGiveUp"] = useCallback(() => {
		setSelected([]);

		toggleIsGameOver(true);
		setGame((prev) => ({
			...prev,
			completed_at: new Date(),
		}));
	}, []);

	const onShuffle: UseGame[1]["onShuffle"] = useCallback(() => {
		const correctBlocks: PuzzleBlock[] = [];
		const incorrectBlocks: PuzzleBlock[] = [];

		blocks.forEach((block) => {
			if (game.correct.includes(block.puzzle_group_id)) {
				correctBlocks.push(block);
				return;
			}

			incorrectBlocks.push(block);
		});

		setBlocks([...correctBlocks, ...shuffle(incorrectBlocks)]);
	}, [blocks, game.correct]);

	/**
	 * Effects
	 */

	// When `props.puzzle` changes, toggle `isLoading` state to true
	useEffect(() => {
		if (puzzle.id === props.puzzle.id) {
			return;
		}

		toggleIsLoading(true);
	}, [props.puzzle.id, puzzle.id]);

	// When `isLoading` and `useGameLocal`'s `isLoading` changes reset state
	useEffect(() => {
		if (!isLoading || local.isLoading) {
			return;
		}

		const newGame: GamePayload = pickLatestGame(props.game, local.games[props.puzzle.id]);
		const newWrongAttempts: number = getPuzzleBlocksFromAttempts(
			newGame,
			props.puzzle,
		).reduce<number>((prev, current) => (arePuzzleBlocksSameGroup(current) ? prev : prev + 1), 0);

		setBlocks(props.puzzle.groups.flatMap((group) => group.blocks));
		setGame(newGame);
		setPuzzle(props.puzzle);
		setSelected([]);
		setWrongAttempts(newWrongAttempts);

		toggleIsGameOver(
			() =>
				newWrongAttempts >= props.puzzle.max_attempts ||
				(!!newGame.completed_at && newGame.correct.length !== props.puzzle.groups.length),
		);
		toggleIsLoading(false);
		toggleIsWinnerWinnerChickenDinner(
			() => !!newGame.completed_at && newGame.correct.length === props.puzzle.groups.length,
		);
		toggleIsWrong(false);

		setBlocks((prev) => {
			if (newGame.correct.length === 0) {
				return shuffle(prev);
			}
			// 1. Filter blocks so only blocks that belong to a correct group is returned
			// 2. Group by `group_id`
			// 3. Flatten array
			const grouped = groupBy(
				prev.filter((b) => game.correct.includes(b.puzzle_group_id)),
				(b) => b.puzzle_group_id,
			).flat();

			// 1. Order blocks by putting correctly guessed on top
			// 2. Remove duplicates
			const shuffled = shuffle(prev);

			return uniqueBy([...grouped, ...shuffled], (item) => item.id);
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, local.isLoading]);

	// When `isWrong` is true, reset it to false and clear `selected` after 300ms to play the animation
	useEffect(() => {
		if (!isWrong) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setSelected([]);
			toggleIsWrong(false);
		}, 450);

		// eslint-disable-next-line consistent-return
		return () => {
			window.clearTimeout(timeout);
		};
	}, [isWrong]);

	// Listen to when the user gives up and end game
	useEffect(() => {
		if (!isGivenUp || game.completed_at) {
			return;
		}

		onGiveUp();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game.completed_at, isGivenUp]);

	// Listen to when the shuffle key is pressed and shuffle the blocks accordingly
	useEffect(() => {
		if (!isShuffle || game.completed_at) {
			return;
		}

		onShuffle();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game.completed_at, isShuffle]);

	return [
		{
			blocks,
			game,
			isGameOver,
			isLoading,
			isWinnerWinnerChickenDinner,
			isWrong,
			puzzle,
			selected,
			wrongAttempts,
		},
		{
			onBlockSelect,
			onGiveUp,
			onShuffle,
		},
	];
}
