import { NOT_FOUND_ERROR_CODE } from '../constants';

export default class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = NOT_FOUND_ERROR_CODE;
  }
}
