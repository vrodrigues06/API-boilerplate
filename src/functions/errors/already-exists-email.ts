import { AppError } from './app-error.js'

export class AlreadyExistsEmailError extends AppError {
  constructor(message = 'Email already exists') {
    super(message, 409)
  }
}
