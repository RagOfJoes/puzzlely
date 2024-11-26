import type { z } from "zod";

import type { PuzzleCreatePayloadSchema } from "@/schemas/puzzle-create-payload";

export type PuzzleCreatePayload = z.infer<typeof PuzzleCreatePayloadSchema>;
