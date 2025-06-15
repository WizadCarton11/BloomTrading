export class CustomError extends Error {
  statusCode: number;
  code: string;
  metadata: any;
  isOperational: boolean;
  timestamp: string;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = 'UNKNOWN_ERROR',
    metadata: any = {},
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.metadata = metadata;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Capture stack trace, omit from production if desired
    if (process.env.NODE_ENV !== 'production') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}