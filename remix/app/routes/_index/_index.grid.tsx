import { useNavigation } from "@remix-run/react";

import { Grid, GridBlock, GridBlocks, GridGroup, GridMenu } from "@/components/grid";
import { useGameContext } from "@/hooks/use-game";

export function IndexGrid() {
	const [state, actions] = useGameContext();

	const navigation = useNavigation();

	const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";

	return (
		<Grid>
			{(isLoading || state.blocks.length === 0) && (
				<GridBlocks>
					{Array.from({ length: 16 }).map((_, i) => (
						<GridBlock
							className="animate-pulse"
							disabled
							hasCorrect={false}
							isError={false}
							isSelected={false}
							key={`GridBlock-skeleton-${i + 1}`}
						/>
					))}
				</GridBlocks>
			)}

			{!isLoading && state.blocks.length > 0 && (
				<GridBlocks>
					{state.game.correct.map((group_id) => {
						const group = state.game.puzzle.groups.find((g) => g.id === group_id);
						if (!group) {
							return null;
						}

						return <GridGroup key={group.id}>{group.description}</GridGroup>;
					})}

					{state.blocks.map((block) => {
						const isCorrect = state.game.correct.includes(block.puzzle_group_id);
						const isSelected = state.selected.findIndex((b) => b.id === block.id) !== -1;

						if (isCorrect) {
							return null;
						}

						return (
							<GridBlock
								disabled={state.isGameOver || state.isWinnerWinnerChickenDinner}
								hasCorrect={state.game.correct.length > 0}
								isError={isSelected && state.isWrong}
								isSelected={isSelected && !state.isWrong}
								key={`${block.puzzle_group_id}-${block.value}`}
								onClick={() => actions.onBlockSelect(block)}
							>
								{block.value}
							</GridBlock>
						);
					})}
				</GridBlocks>
			)}

			{!isLoading && (state.isGameOver || state.isWinnerWinnerChickenDinner) && (
				<GridMenu
					blocks={state.blocks}
					game={state.game}
					isSuccess={state.isWinnerWinnerChickenDinner}
				/>
			)}
		</Grid>
	);
}
