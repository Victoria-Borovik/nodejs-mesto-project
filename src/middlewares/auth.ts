import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorText } from '../constants';
import UnauthorisedError from '../errors/unauthorizes-err';

const { NODE_ENV, JWT_SECRET } = process.env;

export default (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(new UnauthorisedError(errorText.user.unauthorised));
  }

  let payload;
  try {
    const key = NODE_ENV === 'production' ? JWT_SECRET : 'super-secret';

    if (!key) {
      return next(new UnauthorisedError(errorText.user.noToken));
    }

    payload = jwt.verify(token, key);
  } catch (_err) {
    return next(new UnauthorisedError(errorText.user.noToken));
  }

  if (typeof payload !== 'object' || !('_id' in payload)) {
    return next(new UnauthorisedError(errorText.user.invalidToken));
  }

  req.user = { _id: payload._id };
  return next();
};
