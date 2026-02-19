import { VALIDATION_ERROR_CODE } from '../constants';

export default class ValidationError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = VALIDATION_ERROR_CODE;
  }
}
