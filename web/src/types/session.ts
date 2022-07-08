import { User } from './user';

export type Session = {
  id: string;
  token: string;
  state: 'Unauthenticated' | 'Authenticated';
  createdAt: Date;
  expiresAt?: Date;
  authenticatedAt?: Date;

  user?: User;
};
