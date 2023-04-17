import { useState } from "react";

import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { useRouter } from "next/router";

import Details from "./Details";
import Games from "./Games";
import Puzzles from "./Puzzles";
import type { UserContainerProps } from "./types";

export function UserContainer(props: UserContainerProps) {
  const { user } = props;

  const { query, replace } = useRouter();

  const [tab, setTab] = useState(() => {
    if (query?.tab !== "games" && query?.tab !== "puzzles") {
      return "puzzles";
    }

    return query.tab;
  });

  return (
    <article>
      <div className="flex flex-col gap-12">
        <Details user={user} />

        <section>
          <Tabs.Root
            className="flex flex-col"
            onValueChange={(newValue) => {
              if (newValue !== "games" && newValue !== "puzzles") {
                return;
              }

              setTab(newValue);
              replace({ query: { ...query, tab: newValue } }, undefined, {
                scroll: false,
                shallow: true,
              });
            }}
            value={tab}
          >
            <Tabs.List className="flex shrink-0">
              {[
                { label: "Puzzles", value: "puzzles" },
                { label: "Games", value: "games" },
              ].map((trigger) => (
                <Tabs.Trigger
                  key={trigger.value}
                  className={clsx(
                    "flex h-10 select-none items-center justify-center rounded-lg px-4 font-semibold leading-none text-muted outline-none transition",

                    "data-[state=active]:border data-[state=active]:bg-surface data-[state=active]:text-text",
                    "data-[state=active]:focus:relative data-[state=active]:focus:ring",
                    "hover:bg-muted/10"
                  )}
                  value={trigger.value}
                >
                  {trigger.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content
              className={clsx(
                "grow py-4 outline-none",

                "focus-visible:ring"
              )}
              value="puzzles"
            >
              <Puzzles user={user} />
            </Tabs.Content>
            <Tabs.Content
              className={clsx(
                "grow py-4 outline-none",

                "focus-visible:ring"
              )}
              value="games"
            >
              <Games user={user} />
            </Tabs.Content>
          </Tabs.Root>
        </section>
      </div>
    </article>
  );
}
