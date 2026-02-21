export const CREATED_SUCCESS_CODE = 201;

export const UNAUTHORIZED_ERROR_CODE = 401;
export const FORBIDDEN_ERROR_CODE = 403;
export const NOT_FOUND_ERROR_CODE = 404;
export const CONFLICT_ERROR_CODE = 409;
export const SERVER_ERROR_CODE = 500;

export const errorText = {
  user: {
    invalidId: 'Пользователь с указанным _id не найден',
    notFound: 'Пользователь по указанному _id не найден',
    invalidCredentials: 'Неправильные почта или пароль',
    noToken: 'Токен не определён в переменных окружения',
    invalidToken: 'Неверный формат токена',
    unauthorised: 'Необходима авторизация',
    invalidEmail: 'Некорректный формат email',
    conflict: 'Пользователь с таким email уже существует',
  },
  card: {
    invalidId: 'Передан несуществующий _id карточки',
    notFound: 'Карточка с указанным _id не найдена',
    forbidden: 'Нельзя удалить чужую карточку',
  },
  serverFailed: 'На сервере произошла ошибка',
  routeNotFound: 'Запрашиваемый ресурс не найден',
};

export const successText = {
  login: 'Успешная аутентификация',
};

export const SALT_ROUNDS = 10;

export const urlRegex = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(ru|net|com)(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?#?$/;
