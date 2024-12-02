import type { z } from "zod";

import type { UserUpdatePayloadSchema } from "@/schemas/user-update-payload";

export type UserUpdatePayload = z.infer<typeof UserUpdatePayloadSchema>;
