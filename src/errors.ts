export class XApiError extends Error {
  public readonly code?: string | number;

  constructor(message: string, code?: string | number, cause?: unknown) {
    super(message, { cause });
    this.name = 'XApiError';
    this.code = code;
  }
}

export class AuthError extends XApiError {
  constructor(message: string, code?: string | number) {
    super(message, code);
    this.name = 'AuthError';
  }
}

export class HttpError extends XApiError {
  constructor(message: string, code?: string | number) {
    super(message, code);
    this.name = 'HttpError';
  }
}

export class MediaUploadError extends XApiError {
  constructor(message: string, code?: string | number) {
    super(message, code);
    this.name = 'MediaUploadError';
  }
}

export class BinaryNotFoundError extends XApiError {
  constructor(message: string) {
    super(message, 'BINARY_NOT_FOUND');
    this.name = 'BinaryNotFoundError';
  }
}
