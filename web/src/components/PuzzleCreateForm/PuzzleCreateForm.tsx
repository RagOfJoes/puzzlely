import type { ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { FormProvider, useForm } from "react-hook-form";

import type { PuzzleCreatePayload } from "@/types/puzzle";

import Groups from "./Groups";
import Meta from "./Meta";
import { puzzleCreateSchema } from "./schema";
import Settings from "./Settings";
import Submit from "./Submit";
import type { PuzzleCreateFormProps } from "./types";

export const PuzzleCreateForm = forwardRef<
  ElementRef<typeof Primitive.form>,
  PuzzleCreateFormProps
>((props, ref) => {
  const { className, defaultValues, onSubmit = () => {}, ...other } = props;

  const formCtx = useForm<PuzzleCreatePayload>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(puzzleCreateSchema),
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
          handleSubmit(onSubmit)(e);
        }}
      >
        <Meta />
        <Settings />
        <Groups />
        <Submit />
      </Primitive.form>
    </FormProvider>
  );
});

PuzzleCreateForm.displayName = "PuzzleCreateForm";
