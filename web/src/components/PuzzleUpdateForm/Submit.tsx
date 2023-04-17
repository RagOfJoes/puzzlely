import * as AlertDialog from "@radix-ui/react-alert-dialog";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { IoTrash } from "react-icons/io5";

import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import type { PuzzleUpdatePayload } from "@/types/puzzle";

import type { PuzzleUpdateFormProps } from "./types";

function Submit(
  props: Pick<PuzzleUpdateFormProps, "isDeleted" | "isDeleting" | "onDelete">
) {
  const { isDeleted, isDeleting, onDelete = () => {} } = props;

  const { formState } = useFormContext<PuzzleUpdatePayload>();
  const { isDirty, isSubmitSuccessful, isSubmitting, isValid } = formState;

  return (
    <>
      <PuzzleFormCard hideDivider>
        <div className="flex w-full items-center justify-between gap-2">
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <button
                aria-label="Open Settings"
                className={clsx(
                  "flex h-10 w-10 shrink-0 select-none appearance-none items-center justify-center rounded-lg border border-transparent bg-transparent text-text outline-none transition",

                  "disabled:cursor-not-allowed disabled:text-subtle",
                  "focus-visible:enabled:ring",
                  "hover:enabled:bg-muted/10"
                )}
                disabled={
                  isDeleted || isDeleting || isSubmitting || isSubmitSuccessful
                }
              >
                {isDeleting ? (
                  <CgSpinner
                    className="shrink-0 animate-spin fill-subtle"
                    size={24}
                  />
                ) : (
                  <IoTrash />
                )}
              </button>
            </AlertDialog.Trigger>

            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-10 bg-base/50" />

              <AlertDialog.Content
                className={clsx(
                  "fixed left-1/2 top-1/2 z-10 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-surface p-6",

                  "focus:outline-none"
                )}
              >
                <AlertDialog.Title className="text-xl font-semibold">
                  Are you absolutely sure?
                </AlertDialog.Title>

                <AlertDialog.Description className="mt-4 text-sm font-medium text-subtle">
                  Deleting this puzzle cannot be undone. This will permanently
                  delete this puzzle and all games associated with it.
                </AlertDialog.Description>

                <div className="mt-4 flex w-full items-center justify-end gap-2">
                  <AlertDialog.Cancel asChild>
                    <button
                      aria-label="Open Settings"
                      className={clsx(
                        "relative flex h-10 shrink-0 select-none appearance-none items-center justify-center whitespace-nowrap rounded-lg border border-transparent bg-transparent px-4 font-semibold text-text outline-none transition",

                        "disabled:cursor-not-allowed disabled:text-subtle",
                        "focus-visible:enabled:ring",
                        "hover:enabled:bg-muted/10"
                      )}
                    >
                      Cancel
                    </button>
                  </AlertDialog.Cancel>

                  <AlertDialog.Action asChild>
                    <button
                      className={clsx(
                        "relative flex h-10 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

                        "active:enabled:bg-cyan/70",
                        "disabled:cursor-not-allowed disabled:bg-cyan/40",
                        "focus-visible:enabled:ring focus-visible:enabled:ring-cyan/60",
                        "hover:enabled:bg-cyan/70"
                      )}
                      onClick={onDelete}
                    >
                      Delete Puzzle
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>

          <button
            className={clsx(
              "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

              "active:enabled:bg-cyan/70",
              "disabled:cursor-not-allowed disabled:bg-cyan/40",
              "focus-visible:enabled:ring focus-visible:enabled:ring-cyan/60",
              "hover:enabled:bg-cyan/70"
            )}
            disabled={
              isDeleted ||
              isDeleting ||
              !isDirty ||
              !isValid ||
              isSubmitting ||
              isSubmitSuccessful
            }
            type="submit"
          >
            {isSubmitting && (
              <CgSpinner
                className="shrink-0 animate-spin fill-text"
                size={24}
              />
            )}
            {isSubmitting ? "Updating Puzzle..." : "Update Puzzle"}
          </button>
        </div>
      </PuzzleFormCard>
    </>
  );
}

export default Submit;
