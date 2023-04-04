import express from 'express';
import { createUser, getUsers, getUserById, updateUserById, deleteUserById, authenticate, loginUser } from '../controllers/userControllers';

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', loginUser);
router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, updateUserById);
router.delete('/:id', authenticate, deleteUserById);
export default router;
