import type { User } from "./user";

/**
 * Base
 */

export type Block = {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Unique identifier of the group that this block belongs to
   */
  groupID: string;
  /**
   * Text that will be displayed on the ui
   */
  value: string;
};
export type Group = {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Array of string fragments that can be used to compare user input with intended answer
   */
  answers: string[];
  /**
   * Description for the group that can explain the linkage, fun facts, etc.
   */
  description: string;
  /**
   * Blocks that belongs to this group
   */
  blocks: Block[];
};
export type Puzzle = {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Name of the puzzle
   */
  name: string;
  /**
   * Difficulty of the connection between blocks
   */
  difficulty: "Easy" | "Medium" | "Hard";
  /**
   * Description can be used as hints, red herrings, etc.
   */
  description?: string;
  /**
   * Restrict what `config.maxAttempts` setting a user can configure
   */
  maxAttempts: number;
  /**
   * Restrict what `config.timeAllowed` setting a user can configure
   */
  timeAllowed: number;
  /**
   * Number of likes
   */
  numOfLikes: number;
  /**
   * Whether user has liked Puzzle
   */
  likedAt?: Date | null;
  /**
   * When the puzzle was created
   */
  createdAt: Date;
  /**
   * If and when the puzzle was update
   */
  updatedAt?: Date;
  /**
   * Group of blocks. For now, this is limited to 4.
   *
   * TODO: Allow this to be customizable
   */
  groups: Group[];
  /**
   * Who created the puzzle
   */
  createdBy: User;
};

/**
 * Payloads
 */

export type PuzzleCreatePayload = Pick<
  Puzzle,
  "name" | "description" | "difficulty" | "maxAttempts" | "timeAllowed"
> & {
  groups: (Pick<Group, "answers" | "description"> & {
    blocks: { value: Block["value"] }[];
  })[];
};
export type PuzzleUpdatePayload = Pick<
  Puzzle,
  "name" | "description" | "difficulty"
> & {
  groups: Pick<Group, "id" | "description">[];
};

/**
 * Cursor pagination
 */

export type PuzzleNode = Omit<Puzzle, "groups">;
export type PuzzleEdge = {
  cursor: string;
  node: PuzzleNode;
};
export type PuzzleConnection = {
  edges: PuzzleEdge[];
  pageInfo: {
    cursor: string;
    hasNextPage: boolean;
  };
};

/**
 * Misc.
 */

export type PuzzleFilters =
  | "customizable_attempts"
  | "customizable_time"
  | "difficulty"
  | "num_of_likes";
export type PuzzleLike = {
  id: string;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
};
