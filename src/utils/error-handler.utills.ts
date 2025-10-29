export class ErrorHandler extends Error {
  public statusCode: number;
  public context?: Record<string, unknown>;

  constructor(message: string, statusCode: number, context?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}