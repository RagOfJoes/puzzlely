import { forwardRef } from "react";

import clsx from "clsx";

import omit from "@/lib/omit";
import pick from "@/lib/pick";

import type { TextareaProps } from "./types";
import { useFormControlProps } from "../FormControl";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const { children, className, placeholder = "...", ...other } = props;

    const ctx = useFormControlProps(
      pick(props, ["disabled", "id", "invalid", "readOnly", "required"])
    );

    return (
      <textarea
        {...omit(other, ["disabled", "id", "invalid", "readOnly", "required"])}
        {...omit(ctx, ["invalid"])}
        ref={ref}
        className={clsx(
          "relative h-10 min-h-[5rem] w-full min-w-0 resize-none appearance-none rounded-lg border border-muted/20 bg-surface px-4 py-2 font-medium outline-none transition",

          "aria-[invalid=true]:enabled:border-red",
          "disabled:cursor-not-allowed disabled:bg-muted/10 disabled:text-muted/60 disabled:placeholder:text-muted",
          "focus:enabled:ring",
          "placeholder:enabled:text-subtle",

          className
        )}
        placeholder={placeholder}
      >
        {children}
      </textarea>
    );
  }
);

Textarea.displayName = "Textarea";
