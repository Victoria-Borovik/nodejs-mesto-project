import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users';
import {
  CREATED_SUCCESS_CODE,
  VALIDATION_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  SERVER_ERROR_CODE,
  SALT_ROUNDS,
  errorText,
} from '../constants';

const { NODE_ENV, JWT_SECRET } = process.env;

export const getUsers = (_: Request, res: Response) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => (
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: errorText.serverFailed })
    ));
};

export const getUser = (req: Request, res: Response) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: errorText.user.notFound });
      }

      return res.send({ data: user });
    })
    .catch(() => (
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: errorText.serverFailed })
    ));
};

export const getCurrentUser = (req: Request, res: Response) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(UNAUTHORIZED_ERROR_CODE).send({
      message: 'Необходима авторизация', // ToDo
    });
  }

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: errorText.user.notFound });
      }

      return res.send({ data: user });
    })
    .catch(() => (
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: errorText.serverFailed })
    ));
};

export const createUser = (req: Request, res: Response) => {
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
        return res
          .status(VALIDATION_ERROR_CODE)
          .send({ message: errorText.user.invalidCreateData });
      }

      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: errorText.serverFailed });
    });
};

export const login = (req: Request, res: Response) => {
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
        sameSite: 'strict',
        maxAge: 3600000 * 24 * 7,
      }).end();
    })
    .catch((err) => {
      res
        .status(UNAUTHORIZED_ERROR_CODE)
        .send({ message: err.message });
    });
};

export const updateUser = (req: Request, res: Response) => {
  const userId = req.user;
  const { name, about, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, about, avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: errorText.user.invalidId });
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(VALIDATION_ERROR_CODE)
          .send({ message: errorText.user.invalidUpdateData });
      }

      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: errorText.serverFailed });
    });
};

export const updateAvatar = (req: Request, res: Response) => {
  const userId = req.user;
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: errorText.user.invalidId });
      }

      if (!avatar) {
        return res
          .status(VALIDATION_ERROR_CODE)
          .send({ message: errorText.user.invalidUpdateAvatar });
      }

      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res
          .status(VALIDATION_ERROR_CODE)
          .send({ message: errorText.user.invalidUpdateAvatar });
      }

      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: errorText.serverFailed });
    });
};
