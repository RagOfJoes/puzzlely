export interface ErrorResponse {
	success: false;
	error: string;
}

export interface SuccessResponse<T> {
	success: true;
	data: T;
}

export type Response<T> = ErrorResponse | SuccessResponse<T>;
