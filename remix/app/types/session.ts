import type { User } from "./user";

export type Session = {
	id: string;
	state: "Unauthenticated" | "Authenticated";

	created_at: Date;
	expires_at?: Date;
	authenticated_at?: Date;

	user?: User;
};
