const express = require('express')
const authRouter = express.Router();
const {signupUser,loginUser, getCurrentUser} = require ('../controllers/authController');
const { requireAuth, checkRole } = require('../middleware/authMiddleware');



//  authRouter.get('/signup',)
//  authRouter.get('/login',)
  authRouter.post('/signup',signupUser)
  authRouter.post('/login',loginUser)
  authRouter.get('/current-user',requireAuth,getCurrentUser) 

 module.exports = {authRouter} ; 