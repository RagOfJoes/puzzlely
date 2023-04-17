import * as Popover from "@radix-ui/react-popover";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import clsx from "clsx";
import Link from "next/link";
import { IoSettings } from "react-icons/io5";

import { useColorModeCtx } from "@/components/ColorMode";

export function Settings() {
  const { colorMode, setColorMode } = useColorModeCtx();

  return (
    <Popover.Root>
      <Popover.PopoverTrigger asChild>
        <button
          aria-label="Open Settings"
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-surface text-subtle outline-none transition",

            "focus:ring",
            "hover:bg-muted/10"
          )}
        >
          <IoSettings />
        </button>
      </Popover.PopoverTrigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-10 w-80 rounded-lg border bg-surface shadow"
        >
          <header className="border-b px-3 py-4 font-semibold">Settings</header>

          <div className="px-4 py-6">
            <p className="text-sm font-medium">Appearance</p>

            <ToggleGroup.Root
              type="single"
              value={colorMode}
              aria-label="Color Mode"
              className="mt-2 flex rounded-md bg-muted/20"
              onValueChange={(newValue) => {
                if (newValue !== "dark" && newValue !== "light") {
                  return;
                }

                setColorMode(newValue);
              }}
            >
              {[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
              ].map((item) => (
                <ToggleGroup.Item
                  value={item.value}
                  key={`colorMode-option-${item.value}`}
                  className={clsx(
                    "flex flex-1 items-center justify-center rounded-md px-4 py-1 text-sm font-medium text-subtle outline-none",

                    "aria-checked:bg-cyan aria-checked:text-surface aria-checked:focus-visible:ring-cyan/60",
                    "focus-visible:ring"
                  )}
                >
                  {item.label}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
          </div>

          <footer className="border-t p-4">
            <ul className="flex items-center justify-center gap-1">
              <Link
                href="/faq"
                className={clsx(
                  "text-xs font-medium text-subtle outline-none",

                  "focus-visible:ring"
                )}
              >
                F.A.Q
              </Link>

              <p
                role="separator"
                className="select-none text-xs font-medium text-subtle"
              >
                &bull;
              </p>

              <Link
                href="/privacy"
                className={clsx(
                  "text-xs font-medium text-subtle outline-none",

                  "focus-visible:ring"
                )}
              >
                Privacy Policy
              </Link>
            </ul>
          </footer>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
