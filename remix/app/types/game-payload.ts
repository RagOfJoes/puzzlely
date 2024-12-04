import type { z } from "zod";

import type { GamePayloadSchema } from "@/schemas/game-payload-schema";

export type GamePayload = z.infer<typeof GamePayloadSchema>;
