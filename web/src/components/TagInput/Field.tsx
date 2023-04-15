import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import { useMergeRefs } from "@/hooks/useMergeRefs";
import omit from "@/lib/omit";
import pick from "@/lib/pick";

import { useTagInputCtx } from "./Context";
import type { TagInputFieldProps } from "./types";
import { useFormControlProps } from "../FormControl";

export const TagInputField = forwardRef<
  ElementRef<typeof Primitive.input>,
  TagInputFieldProps
>((props, ref) => {
  const { children: childrenProp, className, ...otherWrapperProps } = props;
  const {
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    placeholder = "...",
    ...otherInputProps
  } = otherWrapperProps;

  const {
    inputRef,
    inputWrapperRef,
    query,
    setQuery,
    setValue,
    tagProps,
    value,
  } = useTagInputCtx();

  const mergedRef = useMergeRefs(ref, inputRef);

  const ctx = useFormControlProps(
    pick(props, ["disabled", "id", "invalid", "readOnly", "required"])
  );

  const children =
    typeof childrenProp === "function" ? childrenProp(tagProps) : childrenProp;

  return (
    <Primitive.ul
      ref={inputWrapperRef}
      className={clsx(
        "relative flex h-fit min-h-[2.25rem] w-full cursor-text list-none appearance-none flex-wrap gap-3 overflow-hidden rounded-lg border px-4 py-1.5 font-medium outline-none transition",

        "aria-disabled:cursor-not-allowed aria-disabled:bg-muted/10 aria-disabled:text-muted/60 aria-disabled:placeholder:text-muted",
        "aria-[invalid=true]:aria-[disabled=false]:border-red",
        "focus-within:ring",

        className
      )}
      aria-disabled={!!ctx.disabled}
      aria-invalid={!!ctx.invalid}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      {children}

      <input
        {...omit(otherInputProps, [
          "disabled",
          "id",
          "invalid",
          "readOnly",
          "required",
        ])}
        // Don't need required here since this technically stores "temporary" values
        {...omit(ctx, ["aria-required", "invalid", "required"])}
        ref={mergedRef}
        className={clsx(
          "relative h-auto w-full min-w-0 appearance-none bg-inherit outline-none transition",

          "placeholder:enabled:text-subtle"
        )}
        placeholder={placeholder}
        value={query}
        onBlur={(e) => {
          onBlur?.(e);

          const inputWrapperIsFocused = inputWrapperRef.current?.contains(
            e.relatedTarget as any
          );

          if (!inputWrapperIsFocused) {
            if (!value.includes(e.target.value)) {
              setQuery("");
            }
          }
        }}
        onChange={(e) => {
          onChange?.(e);

          setQuery(e.target.value);
        }}
        onFocus={(e) => {
          onFocus?.(e);

          e.target.select();
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);

          const { key } = e;
          if (key === "Enter" && query.length > 0) {
            if (!value.includes(query)) {
              setValue((prev) => [...prev, query]);
            }

            setQuery("");

            inputRef.current?.focus();

            e.preventDefault();
          }
        }}
      />
    </Primitive.ul>
  );
});

TagInputField.displayName = "TagInputField";
