import { Request, Response, NextFunction } from 'express';
import { errorText, SERVER_ERROR_CODE } from '../constants';

interface ErrorWithStatus extends Error {
  statusCode: number,
}

export default (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { statusCode = SERVER_ERROR_CODE, message } = err;

  res
    .status(statusCode)
    .send({
      message: !message && statusCode === SERVER_ERROR_CODE
        ? errorText.serverFailed
        : message,
    });
};
