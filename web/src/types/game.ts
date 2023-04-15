import type { Puzzle, PuzzleNode } from "./puzzle";
import type { User } from "./user";

/**
 * Base
 */

export type Result = {
  /**
   * User's guess
   */
  guess: string;
  /**
   * Whether User's guess was within a certain threshold of a Puzzle's answer fragment
   */
  correct: boolean;
  /**
   * The group that this guess was for
   */
  groupID: string;
};
export type Game = {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * User's score for the game
   */
  score: number;
  /**
   * Number of attempts before `completedAt` has been set
   */
  attempts: string[][];
  /**
   * Group ids that the user was able to select correctly
   */
  correct: string[];
  /**
   * Config of the game
   */
  config: {
    /**
     * Max number of attempts allowed. A value of `0` will result in the user having unlimited guess attempts
     */
    maxAttempts: number;
    /**
     * Time allowed for the game
     */
    timeAllowed: number;
  };
  /**
   * Result of the game
   */
  results: Result[];
  /**
   * Code that other users can use to copy `config` and compete with one another
   */
  challengeCode: string;
  /**
   * When game was created
   */
  createdAt: Date;
  /**
   * When the game has started
   */
  startedAt?: Date | null;
  /**
   * This is set when the user has either run out of time, run out of lives, or, the user has connected all `block` into their proper `group`
   */
  guessedAt?: Date | null;
  /**
   * This is set when the user has attempted to guess all `groups` in the puzzle
   */
  completedAt?: Date | null;

  /**
   * Challenged is the game that this game is based off of
   */
  challengedBy?: GameNode;
  /**
   * Puzzle that this game is for
   */
  puzzle: Puzzle;
  /**
   * User that this game belongs to
   */
  user?: User;
};

/**
 * Payloads
 */

export type GameUpdatePayload = Pick<
  Game,
  | "attempts"
  | "completedAt"
  | "config"
  | "correct"
  | "guessedAt"
  | "results"
  | "score"
  | "startedAt"
>;

/**
 * Cursor pagination
 */

export type GameNode = Omit<
  Game,
  "attempts" | "correct" | "challengedBy" | "puzzle" | "results"
> & {
  attempts: number;
  puzzle: PuzzleNode;
};
export type GameEdge = {
  cursor: string;
  node: GameNode;
};
export type GameConnection = {
  edges: GameEdge[];
  pageInfo: {
    cursor: string;
    hasNextPage: boolean;
  };
};

/**
 * Misc.
 */

export type GameUpdateResponse = Omit<Game, "puzzle">;
