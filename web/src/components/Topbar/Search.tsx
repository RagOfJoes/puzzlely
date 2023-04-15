import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { IoSearch } from "react-icons/io5";
import { z } from "zod";

import { FormControl } from "@/components/FormControl";

import { Input, InputLeftIcon } from "../Input";

const schema = z.object({
  search: z
    .string()
    .min(1, "Must have more than 1 character.")
    .max(64, "Must not have more than 64 characters"),
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
        <Input
          {...register("search")}
          placeholder="Search"
          className="border-transparent text-sm"
        >
          <InputLeftIcon>
            <IoSearch />
          </InputLeftIcon>
        </Input>
      </FormControl>
    </form>
  );
}
