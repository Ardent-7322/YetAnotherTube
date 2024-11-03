//Jo bhi error honge unka format esa hoga

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wwrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStacktrace(this, this.constructor);
    }
  }
}

export {ApiError}