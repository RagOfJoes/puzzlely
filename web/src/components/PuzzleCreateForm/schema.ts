import { z } from "zod";

import { PUZZLE_DIFFICULTIES } from "@/lib/constants";

export const puzzleCreateSchema = z.object({
  description: z
    .string()
    .max(512, "Must not have more than 512 characters!")
    .nullish(),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    errorMap: () => ({
      message: `Must be one of: ${PUZZLE_DIFFICULTIES.join(", ")}.`,
    }),
  }),
  groups: z.array(
    z.object({
      answers: z
        .array(
          z
            .string()
            .max(48, "An answer must not have more than 48 characters!")
            .min(1, "Must have at least 1 character!")
            .regex(
              /^[\w\-\s]+$/,
              "Can only contain numbers, letters, and spaces!"
            )
        )
        .max(8, "Each group must have at least 1 answer!")
        .min(1, "Each group can only have a max of 8 answers!"),
      blocks: z
        .array(
          z.object({
            value: z
              .string()
              .max(48, "A block must not have more than 48 characters!")
              .min(1, "Must have at least 1 character!")
              .regex(
                /^[\w\-\s]+$/,
                "Can only contain numbers, letters, and spaces!"
              ),
          })
        )
        .length(4, "Each group must have 4 blocks!"),
      description: z
        .string()
        .max(512, "Must not have more than 512 characters!")
        .min(1, "Must have at least 1 character!"),
    })
  ),
  maxAttempts: z.coerce
    .number()
    .int()
    .nonnegative("Must be greater than 0!")
    .max(999, "Must be less than 999!"),
  name: z
    .string()
    .max(64, "Must not have more than 64 characters!")
    .min(1, "Must have at least 1 character!")
    .regex(/^[\w\-\s]+$/, "Can only contain numbers, letters, and spaces!"),
  timeAllowed: z.coerce
    .number()
    .int()
    .nonnegative("Must be greater than 0!")
    .max(3599000, "Must be less than 3599000!"),
});
