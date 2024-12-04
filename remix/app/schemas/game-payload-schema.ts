import { z } from "zod";

export const GamePayloadSchema = z.object({
	score: z.number().max(4).min(0),

	attempts: z.array(z.array(z.string()).length(4)),
	correct: z.array(z.string()).max(4),

	completed_at: z.nullable(z.optional(z.coerce.date())),
});
