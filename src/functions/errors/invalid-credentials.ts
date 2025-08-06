import { AppError } from './app-error.js'

export class InvalidCredentials extends AppError {
  constructor(message = 'Invalid Credentials') {
    super(message, 400)
  }
}
