import { useMemo } from "react";

import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import { IoChevronDown } from "react-icons/io5";

import type { Block } from "@/types/puzzle";

import type { ResultMenuProps } from "../../types";

function Attempts(
  props: Pick<ResultMenuProps, "blocks"> &
    Pick<ResultMenuProps["game"], "attempts">
) {
  const { attempts, blocks } = props;

  const blocksMap = useMemo(() => {
    const map: { [blockID: string]: Block } = {};
    blocks.forEach((block) => {
      if (!map[block.id]) {
        map[block.id] = block;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Accordion.Root collapsible type="single" className="w-full">
      <Accordion.Item value="attempts">
        <Accordion.Header>
          <Accordion.Trigger
            aria-label="View failed attempts"
            className={clsx(
              "group flex w-full items-center justify-between outline-none",

              "focus-visible:ring"
            )}
          >
            <span className="font-heading text-sm font-bold leading-tight">
              Attempts <span className="text-subtle">({attempts.length})</span>
            </span>
            <IoChevronDown
              className={clsx(
                "transition-transform",

                "group-data-[state=open]:rotate-180"
              )}
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={clsx(
            "overflow-hidden",

            "data-[state=closed]:motion-safe:animate-accordionSlideUp",
            "data-[state=open]:motion-safe:animate-accordionSlideDown"
          )}
        >
          <div className="flex w-full flex-col items-center justify-center gap-1 pt-2">
            {attempts.map((attempt, index) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const key = useMemo(() => {
                return `${attempt.join("__")}__${index}`;
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, []);

              // eslint-disable-next-line react-hooks/rules-of-hooks
              const joinedAttempt = useMemo(() => {
                return attempt.map(
                  (blockID) => blocksMap[blockID]?.value || "-"
                );
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, []);

              return (
                <div key={key} className="w-full rounded-lg bg-red/20 p-2">
                  <div className="flex w-full items-center">
                    {joinedAttempt.map((a, i) => (
                      <s
                        key={a}
                        className={clsx(
                          "w-full basis-1/4 truncate px-2 text-center text-sm font-medium text-red",

                          {
                            "border-r border-r-red":
                              i !== joinedAttempt.length - 1,
                          }
                        )}
                      >
                        {a}
                      </s>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Accordion.Content>

        {/* <Fragment key={a}> */}
        {/*   <s className="text-sm font-medium text-red line-clamp-1"> */}
        {/*     {a} */}
        {/*   </s> */}
        {/**/}
        {/*   {i !== joinedAttempt.length - 1 && ( */}
        {/*     <hr className="mx-2 h-auto w-[1px] self-stretch bg-red" /> */}
        {/*   )} */}
        {/* </Fragment> */}
      </Accordion.Item>
    </Accordion.Root>
  );
}

export default Attempts;
