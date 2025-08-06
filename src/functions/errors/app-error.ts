export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly status: 'fail' | 'error'

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
