import { FORBIDDEN_ERROR_CODE } from '../constants';

export default class ForbiddenError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = FORBIDDEN_ERROR_CODE;
  }
}
