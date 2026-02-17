import express from 'express';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import userRoutes from './routes/users';
import cardsRoutes from './routes/cards';
import fakeUser from './middlewares/fakeUser';
import { NOT_FOUND_ERROR_CODE, errorText } from './constants';

const app = express();

const limiter = rateLimit({
  windowMs: 5000,
  max: 1,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(fakeUser);
app.use('/users', userRoutes);
app.use('/cards', cardsRoutes);

app.use((_, res) => {
  res.status(NOT_FOUND_ERROR_CODE).json({
    message: errorText.routeNotFound,
  });
});

mongoose.connect('mongodb://localhost:27017/mestodb');

app.listen(3000);
