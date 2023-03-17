import { z } from "zod";

import { USERNAME_SCHEMA } from "@/lib/constants";

export const userUpdateSchema = z.object({
  username: USERNAME_SCHEMA,
});
