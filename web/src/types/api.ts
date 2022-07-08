import APIError from '@/api/error';

export type Response<T> = {
  success: boolean;
  message?: string;
  payload?: T;
  error?: APIError;
};
