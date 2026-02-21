import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import { login, createUser } from './controllers/users';
import userRoutes from './routes/users';
import cardsRoutes from './routes/cards';
import { requestLogger, errorLogger } from './middlewares/logger';
import auth from './middlewares/auth';
import handleError from './middlewares/handleError';
import { validateSignIn, validateSignUp } from './middlewares/validation';
import NotFoundError from './errors/not-found-err';
import { errorText } from './constants';

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 5000,
  max: 10,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(cookieParser());
app.use(requestLogger);

app.post('/signin', validateSignIn, login);
app.post('/signup', validateSignUp, createUser);
app.use(auth);
app.use('/users', userRoutes);
app.use('/cards', cardsRoutes);
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(errorText.routeNotFound));
});

app.use(errorLogger);
app.use(errors());
app.use(handleError);

mongoose.connect('mongodb://localhost:27017/mestodb');

app.listen(3000);
