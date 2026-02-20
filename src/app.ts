import express from 'express';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { login, createUser } from './controllers/users';
import userRoutes from './routes/users';
import cardsRoutes from './routes/cards';
import auth from './middlewares/auth';
import handleError from './middlewares/handleError';
import { NOT_FOUND_ERROR_CODE, errorText } from './constants';

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

app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);
app.use('/users', userRoutes);
app.use('/cards', cardsRoutes);

app.use((_, res) => {
  res.status(NOT_FOUND_ERROR_CODE).json({
    message: errorText.routeNotFound,
  });
});

app.use(handleError);

mongoose.connect('mongodb://localhost:27017/mestodb');

app.listen(3000);
