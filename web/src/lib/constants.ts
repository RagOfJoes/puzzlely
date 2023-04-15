import { z } from "zod";

import type { Puzzle, PuzzleFilters } from "@/types/puzzle";

// Game constants
export const GAMES_LIMIT = 24;
export const UNLIMITED_MAX_ATTEMPTS = 0;
export const UNLIMITED_TIME_ALLOWED = 0;

// Puzzle constants
export const PUZZLE_DIFFICULTIES: Puzzle["difficulty"][] = [
  "Easy",
  "Medium",
  "Hard",
];
export const PUZZLES_LIMIT = 36;

// Auth constants
export const SUPPORTED_PROVIDERS = ["discord", "google", "github"];

// App constants
export const COLOR_MODE_COOKIE = "puzzlely-color-mode";
export const FAQ = [
  {
    title: "General",
    questions: [
      {
        question: "How do I play?",
        answer:
          "A puzzle contains 16 words where each group of 4 words have some connection between them. You need to link each group together before the time runs out. After you've solved the puzzle or run out of time you then need to guess each connection.",
      },
      {
        question: "I provided the right connection why is it marked incorrect?",
        answer:
          "Apologies, users provide a list of fragmented words that can cover as many answers as possible. Users are not always able to cover every possible answer as it is quite difficult. Pat yourself in the back anyways since you deserved that point!",
      },
      {
        question: "How do I create a good puzzle?",
        answer:
          'To create a good puzzle you first need to understand how the game evaluates a user\'s guess. Take for example the group Quake, Portal, Doom, and Halo. Providing the answers "shoot" and "game" will pass these guesses: "video game", "first person shooter", and "games". This is because the game checks if the user\'s guess contains the words that you provided in your accepted answers. All this to say providing the shortest form of the answer allows the game to forgive tiny user mistakes increasing the chances of a user enjoying your puzzle.',
      },
    ],
  },
  {
    title: "Privacy",
    questions: [
      {
        question: "Do you sell my data?",
        answer:
          "No. We do not sell or collect your personal data. We solely rely on user donations to keep the site up.",
      },
      {
        question: "What information do you collect from my social account?",
        answer:
          "We only read and store your unique identifier from your social accounts. This to ensure that your account is unique to you and you alone. This information does nothing to reveal your name, email, or any other critical information the social provider may have from you.",
      },
    ],
  },
];
export const LOADING_DATE_PLACEHOLDER = "2022-01-01T12:00:00.000Z";
export const PROFILE_ROUTE = "profile";
export const PUZZLE_OVERVIEW_FILTERS: Record<
  PuzzleFilters,
  {
    label: string;
    options: {
      label: string;
      value: boolean | number | Puzzle["difficulty"];
    }[];
  }
> = {
  customizable_time: {
    label: "Custom Time",
    options: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  },
  customizable_attempts: {
    label: "Custom Attempts",
    options: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  },
  difficulty: {
    label: "Difficulty",
    options: PUZZLE_DIFFICULTIES.map((diff) => ({
      label: diff,
      value: diff,
    })),
  },
  num_of_likes: {
    label: "Num. of Likes",
    options: [1, 5, 10, 25, 50, 100].map((num) => ({
      label: `${num}+`,
      value: num,
    })),
  },
};

// Error messages
export const ERR_FAILED_UPDATE_GAME =
  "Failed to update Game. You may continue playing, but, the Game will not be saved properly.";
export const ERR_PUZZLE_LIKE = "Failed to like puzzle. Please try again later.";
export const ERR_UNAUTHORIZED =
  "You must be logged in to access this resource.";

// Schemas
export const USERNAME_SCHEMA = z
  .string({ required_error: "Required!" })
  .min(4, "Must be more than or equal to 4 characters long!")
  .max(24, "Must be less than or equal to 24 characters long!")
  .regex(/^[a-zA-Z0-9]+$/i, "Must only container letters and numbers!");
