import type { ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";

import type { PuzzleUpdatePayload } from "@/types/puzzle";

import Groups from "./Groups";
import Meta from "./Meta";
import { puzzleUpdateSchema } from "./schema";
import Settings from "./Settings";
import Submit from "./Submit";
import type { PuzzleUpdateFormProps } from "./types";

export const PuzzleUpdateForm = forwardRef<
  ElementRef<typeof Primitive.form>,
  PuzzleUpdateFormProps
>((props, ref) => {
  const {
    className,
    isDeleted,
    isDeleting,
    onDelete = () => {},
    onEdit = () => {},
    puzzle,
    ...other
  } = props;

  const formCtx = useForm<PuzzleUpdatePayload>({
    defaultValues: {
      description: puzzle.description,
      difficulty: puzzle.difficulty,
      groups: puzzle.groups.map((group) => ({
        id: group.id,
        description: group.description,
      })),
      name: puzzle.name,
    },
    mode: "onBlur",
    resolver: zodResolver(puzzleUpdateSchema),
  });
  const { handleSubmit } = formCtx;

  return (
    <FormProvider {...formCtx}>
      <Primitive.form
        {...other}
        ref={ref}
        className={clsx(
          "flex w-full flex-col gap-6",

          className
        )}
        onSubmit={(e) => {
          handleSubmit(onEdit)(e);
        }}
      >
        <Meta />
        <Settings puzzle={puzzle} />
        <Groups puzzle={puzzle} />
        <Submit
          isDeleted={isDeleted}
          isDeleting={isDeleting}
          onDelete={onDelete}
        />
      </Primitive.form>
    </FormProvider>
  );
});

PuzzleUpdateForm.displayName = "PuzzleUpdateForm";
