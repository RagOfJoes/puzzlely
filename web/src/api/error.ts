export enum APIErrorCode {
  BadRequest = "BadRequest",
  Forbidden = "Forbidden",
  Internal = "Internal",
  MethodNotAllowed = "MethodNowAllowed",
  NotFound = "NotFound",
  Unauthorized = "Unauthorized",
}

class APIError extends Error {
  code: APIErrorCode;

  constructor(code?: APIErrorCode, message?: string, ...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }

    this.code = code || APIErrorCode.Internal;
    this.message = message || "Something went wrong. Please try again later.";
  }
}

export default APIError;
