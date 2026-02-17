export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(message, 400, code);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Not found"): ApiError {
    return new ApiError(message, 404, "NOT_FOUND");
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(message, 500, "INTERNAL_ERROR");
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
      },
    };
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  console.error("Unhandled error:", error);
  const apiError = ApiError.internal();
  return Response.json(apiError.toJSON(), { status: 500 });
}
