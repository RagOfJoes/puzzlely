import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";

import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import type { PuzzleCreatePayload } from "@/types/puzzle";

function Submit() {
  const { formState } = useFormContext<PuzzleCreatePayload>();
  const { isDirty, isSubmitSuccessful, isSubmitting, isValid } = formState;

  return (
    <PuzzleFormCard hideDivider>
      <p className="text-sm font-medium text-subtle">
        Make sure all the inputs contain their intended values. Once the Puzzle
        has been created the only fields that&apos;ll be editable are the
        puzzle&apos;s name, description, difficulty, and, group description.
      </p>

      <button
        className={clsx(
          "relative mt-4 flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

          "active:enabled:bg-cyan/70",
          "disabled:cursor-not-allowed disabled:bg-cyan/40",
          "focus-visible:enabled:ring focus-visible:enabled:ring-cyan/60",
          "hover:enabled:bg-cyan/70"
        )}
        disabled={!isDirty || !isValid || isSubmitting || isSubmitSuccessful}
        type="submit"
      >
        {isSubmitting && (
          <CgSpinner className="shrink-0 animate-spin fill-text" size={24} />
        )}
        {isSubmitting ? "Creating Puzzle..." : "Create Puzzle"}
      </button>
    </PuzzleFormCard>
  );
}

export default Submit;
