import { Request, Response, NextFunction } from 'express';
import Card from '../models/cards';
import ValidationError from '../errors/validation-err';
import NotFoundError from '../errors/not-found-err';
import ForbiddenError from '../errors/forbidden-err';
import { CREATED_SUCCESS_CODE, errorText } from '../constants';

export const getCards = (_req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const userId = req.user?._id;

  Card.create({ name, link, owner: userId })
    .then((card) => res
      .status(CREATED_SUCCESS_CODE)
      .send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(errorText.card.invalidCreateData));
      } else {
        next(err);
      }
    });
};

export const deleteCard = (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(errorText.card.notFound);
      }

      if (card.owner.toString() !== userId) {
        throw new ForbiddenError(errorText.card.forbidden);
      }

      return Card.findByIdAndDelete(cardId);
    })
    .then((deletedCard) => {
      res.send({ data: deletedCard });
    })
    .catch(next);
};

export const likeCard = (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;
  const userId = req.user?._id;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true },
  ).then((card) => {
    if (!card) {
      throw new NotFoundError(errorText.card.invalidId);
    }

    return res.send({ data: card });
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new ValidationError(errorText.card.invalidLikeData));
    } else {
      next(err);
    }
  });
};

export const dislikeCard = (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;
  const userId = req.user?._id;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  ).then((card) => {
    if (!card) {
      throw new NotFoundError(errorText.card.invalidId);
    }

    return res.send({ data: card });
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new ValidationError(errorText.card.invalidLikeData));
    } else {
      next(err);
    }
  });
};
