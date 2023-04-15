import { useEffect, useMemo, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { IoFlag, IoRefresh, IoShuffle } from "react-icons/io5";

import { off, on } from "@/lib/hookUtils";

import type { ShortcutsProps } from "../types";

function Shortcuts(props: ShortcutsProps) {
  const { game, onForfeit, onReset, onShuffle } = props;
  const { completedAt, guessedAt, startedAt } = game;

  // const { isOpen, onOpen, onClose } = useDisclosure();
  const [isOpen, toggleIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // If `guessedAt` or `completedAt` is set then shortcuts are useless so just exit early
      if (!!guessedAt || !!completedAt) {
        return;
      }

      switch (e.key) {
        case "[":
          onReset();
          break;
        case "]":
          onShuffle();
          break;
        case "?":
          toggleIsOpen(true);
          break;
        case "Q":
          onForfeit();
          break;
        default:
          break;
      }
    };

    on(window, "keydown", handler);
    return () => {
      off(window, "keydown", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReset, onShuffle]);

  const isDisabled = useMemo(
    () => !startedAt || !!guessedAt || !!completedAt,
    [completedAt, guessedAt, startedAt]
  );

  return (
    <>
      <div className="flex w-full flex-col items-start justify-center gap-3">
        <p className="text-sm text-subtle">
          <strong className="font-bold">Pro Tip</strong>: Press{" "}
          <kbd className="whitespace-nowrap rounded-md border border-b-[3px] px-[0.4em] font-mono text-[0.8em] font-bold leading-[normal] text-subtle">
            ?
          </kbd>{" "}
          for hotkeys
        </p>

        <div className="flex w-full items-center justify-start gap-2">
          <button
            aria-label="Restart game"
            className={clsx(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-transparent bg-surface outline-none transition",

              "disabled:cursor-not-allowed",
              "focus:enabled:ring",
              "hover:enabled:bg-muted/10"
            )}
            disabled={isDisabled}
            onClick={onReset}
          >
            <IoRefresh />
          </button>
          <button
            aria-label="Shuffle blocks"
            className={clsx(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-transparent bg-surface outline-none transition",

              "disabled:cursor-not-allowed",
              "focus:enabled:ring",
              "hover:enabled:bg-muted/10"
            )}
            disabled={isDisabled}
            onClick={onShuffle}
          >
            <IoShuffle />
          </button>
          <button
            aria-label="Forfeit"
            className={clsx(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-transparent bg-surface outline-none transition",

              "disabled:cursor-not-allowed",
              "focus:enabled:ring",
              "hover:enabled:bg-muted/10"
            )}
            disabled={isDisabled}
            onClick={onForfeit}
          >
            <IoFlag />
          </button>
        </div>
      </div>

      <Dialog.Root
        onOpenChange={(newIsOpen) => toggleIsOpen(newIsOpen)}
        open={isOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-10 bg-base/50" />

          <Dialog.Content
            className={clsx(
              "fixed left-1/2 top-1/2 z-10 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-muted/20 bg-surface p-6",

              "focus:outline-none"
            )}
          >
            <Dialog.Title className="text-xl font-semibold">
              Hotkeys
            </Dialog.Title>

            <Dialog.Description className="text-sm font-medium text-subtle">
              Improve your time by using the following hotkeys
            </Dialog.Description>

            <div className="mt-6 flex w-full flex-col items-center justify-center gap-2 pb-4">
              {[
                { action: "Hotkeys", hotkey: "?" },
                { action: "Reset game", hotkey: "[" },
                { action: "Shuffle blocks", hotkey: "]" },
                { action: "Forfeit", hotkey: "Q" },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex w-full items-center justify-between gap-2"
                >
                  <p className="text-sm font-medium text-subtle">
                    {item.action}
                  </p>

                  <kbd className="whitespace-nowrap rounded-md border border-b-[3px] px-[0.4em] font-mono text-[0.8em] font-bold leading-[normal] text-subtle">
                    {item.hotkey}
                  </kbd>
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default Shortcuts;
