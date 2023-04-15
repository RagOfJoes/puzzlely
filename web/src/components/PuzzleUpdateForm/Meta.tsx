import clsx from "clsx";
import { Controller, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/FormControl";
import { Input } from "@/components/Input";
import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import {
  Select,
  SelectList,
  SelectListItem,
  SelectTrigger,
} from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { PUZZLE_DIFFICULTIES } from "@/lib/constants";
import omit from "@/lib/omit";
import type { Puzzle, PuzzleUpdatePayload } from "@/types/puzzle";

function Meta() {
  const { control, formState, register, setValue } =
    useFormContext<PuzzleUpdatePayload>();

  return (
    <PuzzleFormCard
      caption="Fields that can either help or trick the player."
      title="Meta"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          <FormControl
            className={clsx(
              "col-span-3",

              "max-md:col-span-4"
            )}
            invalid={!!formState.errors.name?.message}
            required
          >
            <FormControlLabel>Name</FormControlLabel>

            <Input
              {...register("name")}
              autoComplete="off"
              placeholder="Add a name..."
            />

            <FormControlError>
              {formState.errors.name?.message}
            </FormControlError>

            <FormControlHelper>
              Use proper words to improve the searchability of your puzzle.
            </FormControlHelper>
          </FormControl>

          <Controller
            control={control}
            name="difficulty"
            render={({ field, fieldState }) => (
              <FormControl
                className={clsx(
                  "col-span-1",

                  "max-md:col-span-4"
                )}
                invalid={fieldState.invalid}
                required
              >
                <FormControlLabel>Difficulty</FormControlLabel>

                <Select
                  {...omit(field, ["onBlur", "onChange", "ref"])}
                  onValueChange={(newValue) => {
                    setValue("difficulty", newValue as Puzzle["difficulty"]);
                  }}
                  value={field.value?.toString()}
                >
                  <SelectTrigger
                    ref={field.ref}
                    className="w-full justify-between border border-muted/20"
                    onBlur={field.onBlur}
                    placeholder="Select a difficulty..."
                  />

                  <SelectList
                    className="border"
                    onCloseAutoFocus={() => {
                      field.onBlur();
                    }}
                  >
                    {PUZZLE_DIFFICULTIES.map((difficulty) => (
                      <SelectListItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectListItem>
                    ))}
                  </SelectList>
                </Select>

                <FormControlError>{fieldState.error?.message}</FormControlError>
              </FormControl>
            )}
          />
        </div>

        <FormControl invalid={!!formState.errors.description?.message}>
          <FormControlLabel>Description</FormControlLabel>

          <Textarea
            {...register("description")}
            placeholder="Add a description..."
          />

          <FormControlError>
            {formState.errors.description?.message}
          </FormControlError>
        </FormControl>
      </div>
    </PuzzleFormCard>
  );
}

export default Meta;
