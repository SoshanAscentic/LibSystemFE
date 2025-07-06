export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static success<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  static failure<T, E>(error: E): Result<T, E> {
    return new Result(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value of failed result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error of successful result');
    }
    return this._error!;
  }
}

// src/shared/types/errors.ts
export class BusinessError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends BusinessError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BusinessError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', { resource, id });
    this.name = 'NotFoundError';
  }
}