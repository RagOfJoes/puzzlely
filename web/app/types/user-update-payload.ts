import { z } from "zod";

export const UserUpdatePayloadSchema = z.object({
	username: z
		.string({ required_error: "Required!" })
		.min(4, "Must be more than or equal to 4 characters long!")
		.max(64, "Must be less than or equal to 64 characters long!")
		.regex(
			/^[a-zA-Z][a-zA-Z0-9._-]*[a-zA-Z0-9]$/g,
			"Must start with a letter, end with a letter or number, and can include periods, hyphens, and underscores (but not consecutively).",
		),
});

export type UserUpdatePayload = z.infer<typeof UserUpdatePayloadSchema>;
