import express from 'express';
import { activateUser, registerationUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/registeration', registerationUser);
router.post('/activation', activateUser);


export default router;