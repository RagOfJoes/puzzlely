import { PuzzleCreateForm } from "@/components/PuzzleCreateForm";
import usePuzzleCreate from "@/hooks/usePuzzleCreate";
import {
  maxAttemptsFromDifficulty,
  timeAllowedFromDifficulty,
} from "@/lib/game";

export function PuzzleCreateContainer() {
  const { mutate } = usePuzzleCreate();

  return (
    <article>
      <div className="mx-auto block max-w-3xl">
        <PuzzleCreateForm
          defaultValues={{
            name: "",
            description: "",
            difficulty: "Easy",
            maxAttempts: maxAttemptsFromDifficulty.Easy,
            timeAllowed: timeAllowedFromDifficulty.Easy,
            groups: [
              {
                answers: [],
                blocks: [],
                description: "",
              },
              {
                answers: [],
                blocks: [],
                description: "",
              },
              {
                answers: [],
                blocks: [],
                description: "",
              },
              {
                answers: [],
                blocks: [],
                description: "",
              },
            ],
          }}
          onSubmit={(data) => {
            mutate(data);
          }}
        />
      </div>
    </article>
  );
}
