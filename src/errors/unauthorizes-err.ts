import { UNAUTHORIZED_ERROR_CODE } from '../constants';

export default class UnauthorisedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = UNAUTHORIZED_ERROR_CODE;
  }
}
