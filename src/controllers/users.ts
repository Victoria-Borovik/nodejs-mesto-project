import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users';
import NotFoundError from '../errors/not-found-err';
import UnauthorisedError from '../errors/unauthorizes-err';
import ValidationError from '../errors/validation-err';
import ConflictError from '../errors/conflict-err';

import {
  CREATED_SUCCESS_CODE,
  SALT_ROUNDS,
  errorText,
} from '../constants';

const { NODE_ENV, JWT_SECRET } = process.env;

export const getUsers = (_req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthorisedError(errorText.user.unauthorised);
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(errorText.user.notFound);
      }

      return res.send({ data: user });
    })
    .catch(next);
};

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(errorText.user.notFound);
      }

      return res.send({ data: user });
    })
    .catch(next);
};

export const updateUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthorisedError(errorText.user.unauthorised);
  }

  const { name, about, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, about, avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(errorText.user.notFound);
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(errorText.user.invalidUpdateData));
      } else {
        next(err);
      }
    });
};

export const updateAvatar = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new UnauthorisedError(errorText.user.unauthorised);
  }

  const { avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(errorText.user.notFound);
      }

      if (!avatar) {
        throw new ValidationError(errorText.user.invalidUpdateAvatar);
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(errorText.user.invalidUpdateAvatar));
      } else {
        next(err);
      }
    });
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res
      .status(CREATED_SUCCESS_CODE)
      .send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(errorText.user.invalidCreateData));
      } else if (err.code === 11000) {
        next(new ConflictError(errorText.user.conflict));
      } else {
        next(err);
      }
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const key = NODE_ENV === 'production' ? JWT_SECRET : 'super-secret';

      if (!key) {
        throw new Error(errorText.user.noToken);
      }

      const token = jwt.sign(
        { _id: user._id },
        key,
        { expiresIn: '1w' },
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      });

      res.send({ token });
    })
    .catch(next);
};
