import { PuzzleUpdateForm } from "@/components/PuzzleUpdateForm/PuzzleUpdateForm";
import usePuzzleDelete from "@/hooks/usePuzzleDelete";
import usePuzzleUpdate from "@/hooks/usePuzzleUpdate";

import type { PuzzleUpdateContainerProps } from "./types";

export function PuzzleUpdateContainer(props: PuzzleUpdateContainerProps) {
  const { puzzle } = props;

  const {
    isLoading: isDeleting,
    isSuccess: isDeleted,
    mutateAsync: deletePuzzleAsync,
  } = usePuzzleDelete();
  const { mutateAsync } = usePuzzleUpdate(puzzle.id);

  return (
    <article>
      <div className="mx-auto block max-w-3xl">
        <PuzzleUpdateForm
          isDeleted={isDeleted}
          isDeleting={isDeleting}
          onDelete={async () => {
            try {
              await deletePuzzleAsync(puzzle.id);
            } catch (e) {
              // TODO: Capture Error
            }
          }}
          onEdit={async (data) => {
            try {
              await mutateAsync(data);
            } catch (e) {
              // TODO: Capture error
            }
          }}
          puzzle={puzzle}
        />
      </div>
    </article>
  );
}
