import { Fragment } from "react";

import { Controller, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/FormControl";
import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import { TagInput, TagInputField, TagInputItem } from "@/components/TagInput";
import { Textarea } from "@/components/Textarea";
import omit from "@/lib/omit";
import type { PuzzleCreatePayload } from "@/types/puzzle";

function Groups() {
  const { control, formState, register, setValue } =
    useFormContext<PuzzleCreatePayload>();

  return (
    <PuzzleFormCard
      caption="The building blocks of your puzzle."
      title="Groups"
    >
      {Array.from({ length: 4 }).map((_, g) => {
        const answersError =
          formState.errors.groups?.[g]?.answers?.[0]?.message;
        const blocksError =
          formState.errors.groups?.[g]?.blocks?.[0]?.value?.message;

        return (
          <Fragment key={`groups.${g}`}>
            <h4 className="text-md mt-4 font-heading font-bold">
              Group {g + 1}
            </h4>
            <hr className="mb-4 mt-2 h-[1px] w-full bg-muted/20" />

            <div className="flex flex-col gap-4">
              <Controller
                control={control}
                name={`groups.${g}.blocks`}
                render={({ field, fieldState }) => (
                  <FormControl
                    invalid={fieldState.invalid || !!blocksError}
                    required
                  >
                    <FormControlLabel>Blocks</FormControlLabel>

                    <TagInput
                      {...omit(field, ["onBlur", "onChange", "ref", "value"])}
                      onChange={(newValue) => {
                        if (newValue.length > 4) {
                          return;
                        }

                        setValue(
                          field.name,
                          newValue.map((v) => ({
                            value: v,
                          }))
                        );
                      }}
                      value={field.value.map((v) => v.value)}
                    >
                      <TagInputField
                        // ref={field.ref}
                        onBlur={field.onBlur}
                        placeholder="Type a block, then, hit ENTER ..."
                      >
                        {(itemProps) =>
                          itemProps.map((itemProp) => (
                            <TagInputItem
                              key={itemProp.children}
                              onRemove={itemProp.onRemove}
                            >
                              {itemProp.children}
                            </TagInputItem>
                          ))
                        }
                      </TagInputField>
                    </TagInput>

                    <FormControlError>
                      {fieldState.error?.message || blocksError}
                    </FormControlError>

                    <FormControlHelper>
                      Terms that will link this group together.
                    </FormControlHelper>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={`groups.${g}.answers`}
                render={({ field, fieldState }) => (
                  <FormControl
                    invalid={fieldState.invalid || !!answersError}
                    required
                  >
                    <FormControlLabel>Answers</FormControlLabel>

                    <TagInput
                      {...omit(field, ["onBlur", "onChange", "ref"])}
                      onChange={(newValue) => {
                        if (newValue.length > 8) {
                          return;
                        }

                        setValue(field.name, newValue);
                      }}
                    >
                      <TagInputField
                        // ref={field.ref}
                        onBlur={field.onBlur}
                        placeholder="Type an answer, then, hit ENTER..."
                      >
                        {(itemProps) =>
                          itemProps.map((itemProp) => (
                            <TagInputItem
                              key={itemProp.children}
                              onRemove={itemProp.onRemove}
                            >
                              {itemProp.children}
                            </TagInputItem>
                          ))
                        }
                      </TagInputField>
                    </TagInput>

                    <FormControlError>
                      {fieldState.error?.message || answersError}
                    </FormControlError>

                    <FormControlHelper>
                      Keep words in their shortest form to ensure that you cover
                      as many answers as possible. Example{" "}
                      <i className="font-bold">brit</i> will match{" "}
                      <i className="font-bold">british</i> and{" "}
                      <i className="font-bold">britain</i>.
                    </FormControlHelper>
                  </FormControl>
                )}
              />

              <FormControl
                invalid={!!formState.errors.groups?.[g]?.description?.message}
                required
              >
                <FormControlLabel>Description</FormControlLabel>

                <Textarea
                  {...register(`groups.${g}.description`)}
                  placeholder="Add a description..."
                />

                <FormControlError>
                  {formState.errors.groups?.[g]?.description?.message}
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
