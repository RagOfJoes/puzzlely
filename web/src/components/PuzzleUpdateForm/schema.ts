import { z } from "zod";

import { PUZZLE_DIFFICULTIES } from "@/lib/constants";

export const puzzleUpdateSchema = z.object({
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
      description: z
        .string()
        .max(512, "Must not have more than 512 characters!")
        .min(1, "Must have at least 1 character!"),
      id: z.string().uuid(),
    })
  ),
  name: z
    .string()
    .max(64, "Must not have more than 64 characters!")
    .min(1, "Must have at least 1 character!")
    .regex(/^[\w\-\s]+$/, "Can only contain numbers, letters, and spaces!"),
});
