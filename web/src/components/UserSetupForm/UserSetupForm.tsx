import type { ElementRef } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/FormControl";
import { Input } from "@/components/Input";
import type { UserUpdatePayload } from "@/types/user";

import { userSetupSchema } from "./schema";
import type { UserSetupFormProps } from "./types";

export const UserSetupForm = forwardRef<
  ElementRef<typeof Primitive.form>,
  UserSetupFormProps
>((props, ref) => {
  const { className, defaultValues, onSubmit = () => {}, ...other } = props;

  const { formState, handleSubmit, register } = useForm<UserUpdatePayload>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(userSetupSchema),
  });

  return (
    <Primitive.form
      {...other}
      ref={ref}
      className={clsx(
        "w-full",

        className
      )}
      onSubmit={(e) => {
        handleSubmit(onSubmit)(e);
      }}
    >
      <FormControl required invalid={!!formState.errors.username?.message}>
        <FormControlLabel>Username</FormControlLabel>

        <Input {...register("username")} autoComplete="off" />

        <FormControlError>
          {formState.errors.username?.message}
        </FormControlError>
        <FormControlHelper>
          Must be 4 - 24 characters long. Only letters and numbers are allowed.
        </FormControlHelper>
      </FormControl>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!!formState.errors.username || !formState.isDirty}
          className={clsx(
            "relative flex h-10 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

            "active:bg-cyan/70",
            "disabled:cursor-not-allowed disabled:bg-cyan/40",
            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:bg-cyan/70"
          )}
        >
          Save
        </button>
      </div>
    </Primitive.form>
  );
});

UserSetupForm.displayName = "UserSetupForm";
