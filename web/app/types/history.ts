import { z } from "zod";

export const HistorySchema = z.object({
	puzzles: z
		.array(
			z.object({
				completed_at: z.nullable(z.optional(z.coerce.date())),
				cursor: z.string().base64url(),
				id: z.string().ulid(),
				timestamp: z.coerce.date(),
			}),
		)
		.default([]),
	updated_at: z.nullable(z.optional(z.coerce.date())),
});

export type History = z.infer<typeof HistorySchema>;
