import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { IoSearch } from "react-icons/io5";
import { z } from "zod";

import { FormControl, useFormControlProps } from "@/components/FormControl";
import omit from "@/lib/omit";
import pick from "@/lib/pick";

const schema = z.object({
  search: z
    .string()
    .min(1, "Must have more than 1 character.")
    .max(64, "Must not have more than 64 characters"),
});

// eslint-disable-next-line react/display-name
const Input = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & { invalid?: boolean }
>((props, ref) => {
  const { placeholder = "Search", ...other } = props;

  const ctx = useFormControlProps(
    pick(props, ["disabled", "id", "invalid", "readOnly", "required"])
  );

  return (
    <div className="relative flex w-full text-sm font-medium">
      <div className="pointer-events-none absolute left-0 top-0 z-[2] flex h-10 w-10 items-center justify-center text-subtle">
        <IoSearch className="inline-block h-4 w-4 shrink-0" />
      </div>

      <input
        {...omit(other, [
          "className",
          "disabled",
          "id",
          "invalid",
          "readOnly",
          "required",
        ])}
        {...omit(ctx, ["invalid"])}
        ref={ref}
        placeholder={placeholder}
        className={clsx(
          "relative h-10 w-full min-w-0 appearance-none rounded-lg border border-transparent bg-surface pl-10 pr-4 outline-none transition-shadow",

          "dark:border-muted/20",
          "focus:ring",
          "placeholder:text-muted"
        )}
      />
    </div>
  );
});

export function Search() {
  const router = useRouter();

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<z.infer<typeof schema>>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      search: typeof router.query.term === "string" ? router.query.term : "",
    },
    resolver: zodResolver(schema),
  });

  return (
    <form
      role="search"
      className="w-full"
      onSubmit={handleSubmit(({ search }) => {
        router.push({ pathname: "/search", query: { term: search } });
      })}
    >
      <FormControl
        required
        className="w-full"
        invalid={!!errors.search?.message}
      >
        <Input {...register("search")} />
      </FormControl>
    </form>
  );
}
