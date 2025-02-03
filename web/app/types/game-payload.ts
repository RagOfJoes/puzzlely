import { z } from "zod";

export const GamePayloadSchema = z
	.object({
		score: z.number().max(4).min(0),

		attempts: z.array(z.array(z.string()).length(4)),
		correct: z.array(z.string()).max(4),

		completed_at: z.nullable(z.optional(z.coerce.date())),
	})
	.refine((data) => data.score === data.correct.length, {
		message: "score and correct don't match",
		path: ["score"],
	});

export type GamePayload = z.infer<typeof GamePayloadSchema>;
