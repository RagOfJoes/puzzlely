/**
 * Base
 */

export type User = {
  id: string;
  state: "PENDING" | "COMPLETE";
  username: string;
  createdAt: Date;
  updatedAt?: Date | null;
};

export type UserStats = {
  gamesPlayed: number;
  puzzlesCreated: number;
  puzzlesLiked: number;
};

/**
 * Payloads
 */

export type UserUpdatePayload = {
  username: string;
};
