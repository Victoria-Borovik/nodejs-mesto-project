import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UNAUTHORIZED_ERROR_CODE, errorText } from '../constants';

const { NODE_ENV, JWT_SECRET } = process.env;

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.cookies.jwt;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(UNAUTHORIZED_ERROR_CODE)
      .send({ message: errorText.user.unauthorised });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    const key = NODE_ENV === 'production' ? JWT_SECRET : 'super-secret';

    if (!key) {
      throw new Error(errorText.user.noToken);
    }

    payload = jwt.verify(token, key);
  } catch (err) {
    return res
      .status(UNAUTHORIZED_ERROR_CODE)
      .send({ message: errorText.user.unauthorised });
  }

  if (typeof payload !== 'object' || !('_id' in payload)) { // ToDo
    throw new Error('Invalid token payload');
  }

  req.user = { _id: payload._id };
  return next();
};
