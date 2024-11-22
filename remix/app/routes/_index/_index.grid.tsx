import { Grid, GridBlock, GridBlocks, GridGroup, GridMenu } from "@/components/grid";
import { useGameContext } from "@/hooks/use-game";
import { useIsMounted } from "@/hooks/use-is-mounted";

export function IndexGrid() {
	const [state, actions] = useGameContext();

	// Check if the component is mounted
	const isMounted = useIsMounted();

	return (
		<Grid>
			<GridBlocks>
				{/* Render correct group first */}
				{state.game.correct.map((group_id) => {
					const group = state.game.puzzle.groups.find((g) => g.id === group_id);
					if (!group) {
						return null;
					}

					return <GridGroup key={group.id}>{group.description}</GridGroup>;
				})}

				{/* Render rest of blocks */}
				{state.blocks.map((block) => {
					const isCorrect = state.game.correct.includes(block.puzzle_group_id);
					const isSelected = state.selected.findIndex((b) => b.id === block.id) !== -1;

					if (isCorrect) {
						return null;
					}

					return (
						<GridBlock
							disabled={state.isGameOver || !isMounted() || state.isWinnerWinnerChickenDinner}
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

			{(state.isGameOver || state.isWinnerWinnerChickenDinner) && (
				<GridMenu
					blocks={state.blocks}
					game={state.game}
					isSuccess={state.isWinnerWinnerChickenDinner}
				/>
			)}
		</Grid>
	);
}
