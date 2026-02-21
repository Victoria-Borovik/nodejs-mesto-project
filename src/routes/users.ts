import { Router } from 'express';
import {
  validateUserId, validateUpdateUser, validateUpdateAvatar,
} from '../middlewares/validation';
import {
  getUsers, getUser, updateUser, updateAvatar, getCurrentUser,
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', validateUserId, getUser);
router.patch('/me', validateUpdateUser, updateUser);
router.patch('/me/avatar', validateUpdateAvatar, updateAvatar);

export default router;
