const express = require('express') ; 
const { getUserInfo, getAgenceInfo,getArticleScanAgence ,getAgenceInfoGeneral,getAgenceDetailsAllCommission, getAllStat } = require('../controllers/statistiqueUserController');
const { requireAuth, checkRole } = require('../middleware/authMiddleware');
const { stat } = require('fs/promises');

const  statistiqueForUserRouter = express.Router(); 

statistiqueForUserRouter.get('/userinfo',requireAuth,getUserInfo)
statistiqueForUserRouter.get('/agenceinfo',requireAuth,getAgenceInfo)
statistiqueForUserRouter.get('/agence-items-scanned',requireAuth,getArticleScanAgence)
statistiqueForUserRouter.get('/agence-generale',requireAuth,checkRole('superAdmin'),getAgenceInfoGeneral)
statistiqueForUserRouter.get('/agence-commissions/:numAgence',requireAuth,checkRole('superAdmin'),getAgenceDetailsAllCommission)
statistiqueForUserRouter.get('/generale',requireAuth,checkRole('superAdmin'),getAllStat);

module.exports={statistiqueForUserRouter}