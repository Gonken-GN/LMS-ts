import express from 'express';
import { registerationUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/registeration', registerationUser);

export default router;