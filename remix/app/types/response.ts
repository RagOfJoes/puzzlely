export type Response<T> = {
	error?: Error;
	message?: string;
	payload?: T;
	success: boolean;
};
