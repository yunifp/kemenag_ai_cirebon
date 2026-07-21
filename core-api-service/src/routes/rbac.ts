import { Router } from 'express';
import { getUsers, createUser, updateUserRole, deleteUser } from '../controllers/userController';

const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
