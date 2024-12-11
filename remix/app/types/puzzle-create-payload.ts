import { z } from "zod";

export const PuzzleCreatePayloadSchema = z.object({
	max_attempts: z.coerce
		.number()
		.int()
		.nonnegative("Must be greater than 0!")
		.max(999, "Must be less than 999!")
		.min(1, "Must be greater than 0!"),
	difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
		errorMap: () => ({
			message: "Must be one of: Easy, Medium, or Hard.",
		}),
	}),

	groups: z
		.array(
			z.object({
				description: z
					.string()
					.max(512, "Must not have more than 512 characters!")
					.min(1, "Required!"),

				blocks: z
					.array(
						z.object({
							value: z
								.string()
								.max(48, "A block must not have more than 48 characters!")
								.min(1, "Required!"),
						}),
					)
					.length(4, "Each group must have 4 blocks!"),
			}),
		)
		.length(4, "Each puzzle must have 4 groups!"),
});

export type PuzzleCreatePayload = z.infer<typeof PuzzleCreatePayloadSchema>;
