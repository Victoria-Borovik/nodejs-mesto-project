import { Schema, model } from 'mongoose';
import type { Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import UnauthorisedError from '../errors/unauthorizes-err';
import { errorText } from '../constants';

interface User {
  _id: string;
  name: string,
  about: string,
  avatar: string,
  email: string,
  password: string,
}

interface UserModel extends Model<User> {
  findUserByCredentials(_email: string, _password: string): Promise<User>;
}

const userSchema = new Schema<User, UserModel>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    default: 'Исследователь',

  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value: string) {
        return validator.isEmail(value);
      },
      message: 'Некорректный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
}, {
  versionKey: false,
});

userSchema.static('findUserByCredentials', function findUserByCredentials(
  email: string,
  password: string,
) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorisedError(errorText.user.invalidCredentials);
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorisedError(errorText.user.invalidCredentials);
          }

          return user;
        });
    });
});

export default model<User, UserModel>('user', userSchema);
