import { useCallback, useEffect, useState } from "react";

import { useKey } from "@rwh/react-keystrokes";
import shuffle from "lodash.shuffle";

import { arePuzzleBlocksSameGroup } from "@/lib/are-puzzle-blocks-same-group";
import { createContext } from "@/lib/create-context";
import { getPuzzleBlocksFromAttempts } from "@/lib/get-puzzle-blocks-from-attempts";
import { groupBy } from "@/lib/group-by";
import { uniqueBy } from "@/lib/unique-by";
import type { Game } from "@/types/game";
import type { PuzzleBlock } from "@/types/puzzle";

import { useMount } from "./use-mount";

export type UseGameProps = {
	game: Game;
};

export type UseGame = [
	state: {
		// Blocks that will be rendered
		blocks: PuzzleBlock[];
		// Existing/current game state
		game: Game;
		// Flag to determine if the game is over. Will be triggered if the user has reached the maximum number of attempts
		isGameOver: boolean;
		// Flag to determine if the user has won the game
		isWinnerWinnerChickenDinner: boolean;
		// Flag to determine if the elements inside the `selected` state are wrong
		isWrong: boolean;
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
	const [blocks, setBlocks] = useState<UseGame[0]["blocks"]>(
		props.game.puzzle.groups.flatMap((group) => group.blocks),
	);
	const [wrongAttempts, setWrongAttempts] = useState<number>(() => {
		const joined = getPuzzleBlocksFromAttempts(blocks, props.game);

		return joined.reduce<number>(
			(prev, current) => (arePuzzleBlocksSameGroup(current) ? prev : prev + 1),
			0,
		);
	});
	const [selected, setSelected] = useState<UseGame[0]["selected"]>([]);

	/**
	 * Game state
	 */

	const [game, setGame] = useState<UseGame[0]["game"]>(props.game);

	/**
	 * Flags
	 */

	const isGivenUp = useKey("[");
	const isShuffle = useKey("]");
	const [isGameOver, toggleIsGameOver] = useState<UseGame[0]["isGameOver"]>(
		() =>
			!!props.game.completed_at && props.game.correct.length !== props.game.puzzle.groups.length,
	);
	const [isWinnerWinnerChickenDinner, toggleIsWinnerWinnerChickenDinner] = useState<
		UseGame[0]["isWinnerWinnerChickenDinner"]
	>(
		() =>
			!!props.game.completed_at && props.game.correct.length === props.game.puzzle.groups.length,
	);
	const [isWrong, toggleIsWrong] = useState<UseGame[0]["isWrong"]>(false);

	/**
	 * Lifecycles
	 */

	useMount(() => {
		if (game.correct.length === 0) {
			setBlocks((prev) => shuffle(prev));
			return;
		}

		// 1. Filter blocks so only blocks that belong to a correct group is returned
		// 2. Group by `groupID`
		// 3. Flatten array
		const grouped = groupBy(
			blocks.filter((b) => game.correct.includes(b.puzzle_group_id)),
			(b) => b.puzzle_group_id,
		).flat();

		// 1. Order blocks by putting correctly guessed on top
		// 2. Remove duplicates
		const shuffled = shuffle(blocks);
		setBlocks(uniqueBy([...grouped, ...shuffled], (item) => item.id));
	});

	// When `isWrong` is true, reset it to false and clear `selected` after 300ms to play the animation
	useEffect(() => {
		if (!isWrong) {
			return;
		}

		let timeoutId: number | null = null;

		timeoutId = window.setTimeout(() => {
			setSelected([]);
			toggleIsWrong(false);
		}, 450);

		// eslint-disable-next-line consistent-return
		return () => {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
		};
	}, [isWrong]);

	/**
	 * Actions
	 */

	const onBlockSelect: UseGame[1]["onBlockSelect"] = useCallback(
		(block: PuzzleBlock) => {
			const isComplete = !!game.completed_at;
			const isCorrect = game.correct.includes(block.id);
			const isTooMuchAttempts =
				game.puzzle.max_attempts > 0 && wrongAttempts >= game.puzzle.max_attempts;
			const isTooMuchSelected = selected.length >= 4;

			if (isComplete || isCorrect || isTooMuchAttempts || isTooMuchSelected || isWrong) {
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
				const isMaxAttempt = wrongAttempts + 1 >= game.puzzle.max_attempts;

				setGame((prev) => ({
					...prev,
					attempts: newAttempts,

					completed_at: isMaxAttempt ? new Date() : null,
				}));
				setWrongAttempts(wrongAttempts + 1);

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
			const isGuessedAll = newCorrect.length === game.puzzle.groups.length - 1;
			if (isGuessedAll) {
				// Append last `group_id` to cloned `correct` state
				const lastGroup = game.puzzle.groups
					.filter((g) => !newCorrect.includes(g.id))
					.map((g) => g.id);

				// Make sure there's only one group left also make typescript happy
				if (lastGroup.length === 1 && typeof lastGroup[0] === "string") {
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

			const newScore = isGuessedAll ? game.puzzle.groups.length : game.score + 1;

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
			game.puzzle.groups,
			game.puzzle.max_attempts,
			game.score,
			isWrong,
			selected,
			wrongAttempts,
		],
	);

	const onGiveUp = () => {
		setSelected([]);

		toggleIsGameOver(true);
		setGame((prev) => ({
			...prev,
			completed_at: new Date(),
		}));
	};

	const onShuffle = () => {
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
	};

	/**
	 * Effects
	 */

	// Listen to when the user gives up and end game
	useEffect(() => {
		if (!isGivenUp || game.completed_at) {
			return;
		}

		onGiveUp();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGivenUp]);

	// Listen to when the shuffle key is pressed and shuffle the blocks accordingly
	useEffect(() => {
		if (!isShuffle || game.completed_at) {
			return;
		}

		onShuffle();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isShuffle]);

	return [
		{
			blocks,
			game,
			isGameOver,
			isWinnerWinnerChickenDinner,
			isWrong,
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
