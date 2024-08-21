const express = require('express')
const authRouter = express.Router();
const {signupUser,loginUser, getCurrentUser ,getUsers,getUserById, updateUserDetails} = require ('../controllers/authController');
const { requireAuth, checkRole } = require('../middleware/authMiddleware');



//  authRouter.get('/signup',)
//  authRouter.get('/login',)
  authRouter.post('/signup',signupUser)
  authRouter.post('/login',loginUser)
  authRouter.get('/current-user',requireAuth,getCurrentUser) 
  authRouter.get('/users',requireAuth,checkRole("superAdmin"),getUsers);
  authRouter.get('/users/:id',requireAuth,checkRole("superAdmin"),getUserById)
  authRouter.put('/users/:id',requireAuth,checkRole("superAdmin"),updateUserDetails)

 module.exports = {authRouter} ; 