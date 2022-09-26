import { QueryKey } from '@tanstack/react-query';

import { PuzzleFilters } from '@/types/puzzle';

export const queryKeys: {
  [key in
    | 'Game'
    | 'GamesHistory'
    | 'Me'
    | 'PuzzleDetail'
    | 'PuzzlesCreated'
    | 'PuzzlesLiked'
    | 'PuzzlesList'
    | 'PuzzlesMostLiked'
    | 'PuzzlesMostPlayed'
    | 'Search'
    | 'UsersProfile'
    | 'UsersStats']: QueryKey;
} = {
  // Games
  //

  Game: ['games/play'],
  GamesHistory: ['games/history'],

  // Puzzles
  //

  PuzzlesCreated: ['puzzles/created'],
  PuzzleDetail: ['puzzles/detail'],
  PuzzlesLiked: ['puzzles/liked'],
  PuzzlesList: ['puzzles/list'],
  PuzzlesMostLiked: ['puzzles/mostLiked'],
  PuzzlesMostPlayed: ['puzzles/mostPlayed'],

  // User
  //

  Me: ['me'],
  UsersProfile: ['users/profile'],
  UsersStats: ['users/stats'],

  // Misc.
  Search: ['search'],
};

export const generateQueryKey = {
  // Games
  //

  Game: (gameID: string): QueryKey => [...queryKeys.Game, { id: gameID }],
  GamesHistory: (userID: string): QueryKey => [
    ...queryKeys.GamesHistory,
    { id: userID },
  ],

  // Puzzles
  //

  PuzzlesCreated: (userID: string): QueryKey => [
    ...queryKeys.PuzzlesCreated,
    { id: userID },
  ],
  PuzzleDetail: (puzzleID: string): QueryKey => [
    ...queryKeys.PuzzleDetail,
    { id: puzzleID },
  ],
  PuzzlesLiked: (): QueryKey => [...queryKeys.PuzzlesLiked],
  PuzzlesList: (filters: {
    [key in PuzzleFilters]?: string;
  }): QueryKey => [...queryKeys.PuzzlesList, { filters }],
  PuzzlesMostLiked: (): QueryKey => [...queryKeys.PuzzlesMostLiked],
  PuzzlesMostPlayed: (): QueryKey => [...queryKeys.PuzzlesMostPlayed],

  // User
  //

  Me: (): QueryKey => [...queryKeys.Me],
  UsersProfile: (userID: string): QueryKey => [
    ...queryKeys.UsersProfile,
    { id: userID },
  ],
  UsersStats: (userID: string): QueryKey => [
    ...queryKeys.UsersStats,
    { id: userID },
  ],

  // Misc.
  //

  Search: (term: string): QueryKey => [...queryKeys.Search, { term }],
};
