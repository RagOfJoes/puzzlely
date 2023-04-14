import { Fragment } from "react";

import clsx from "clsx";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/FormControl";
import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import { Textarea } from "@/components/Textarea";
import type { PuzzleUpdatePayload } from "@/types/puzzle";

import type { PuzzleUpdateFormProps } from "./types";

function Groups(props: Pick<PuzzleUpdateFormProps, "puzzle">) {
  const { puzzle } = props;

  const { formState, register } = useFormContext<PuzzleUpdatePayload>();
  const { errors } = formState;

  return (
    <PuzzleFormCard
      caption="The building blocks of your puzzle."
      title="Groups"
    >
      {Array.from({ length: 4 }).map((_, g) => {
        const group = puzzle.groups[g];

        if (!group) {
          return null;
        }

        return (
          <Fragment key={`groups.${g}`}>
            <h4 className="text-md mt-4 font-heading font-bold">
              Group {g + 1}
            </h4>
            <hr className="mb-4 mt-2 h-[1px] w-full bg-muted/20" />

            <input {...register(`groups.${g}.id`)} type="hidden" readOnly />

            <div className="flex flex-col gap-4">
              <div className="relative block">
                <p className="mb-2 font-medium">Blocks</p>

                <ul className="flex list-none flex-wrap gap-3 overflow-hidden">
                  {group.blocks.map((block) => (
                    <li
                      key={`groups.${g}.blocks.${block.id}`}
                      className="flex items-start truncate"
                    >
                      <span className="group inline-flex w-full items-center rounded-md bg-muted/20 px-2 text-sm font-medium">
                        <span
                          className={clsx(
                            "line-clamp-1 inline-block text-ellipsis whitespace-nowrap",

                            "group-aria-disabled:opacity-40"
                          )}
                        >
                          {block.value}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative block">
                <p className="mb-2 font-medium">Answers</p>

                <ul className="flex list-none flex-wrap gap-3 overflow-hidden">
                  {group.answers.map((answer) => (
                    <li
                      key={`groups.${g}.answer.${answer}`}
                      className="flex items-start truncate"
                    >
                      <span className="group inline-flex w-full items-center rounded-md bg-muted/20 px-2 text-sm font-medium">
                        <span
                          className={clsx(
                            "line-clamp-1 inline-block text-ellipsis whitespace-nowrap",

                            "group-aria-disabled:opacity-40"
                          )}
                        >
                          {answer}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <FormControl
                invalid={!!errors.groups?.[g]?.description?.message}
                required
              >
                <FormControlLabel>Description</FormControlLabel>

                <Textarea
                  {...register(`groups.${g}.description`)}
                  placeholder="Add a description..."
                />

                <FormControlError>
                  {errors.groups?.[g]?.description?.message}
                </FormControlError>

                <FormControlHelper>
                  Description of how, what, or, why the blocks link the group
                  together.
                </FormControlHelper>
              </FormControl>
            </div>
          </Fragment>
        );
      })}
    </PuzzleFormCard>
  );
}

export default Groups;
