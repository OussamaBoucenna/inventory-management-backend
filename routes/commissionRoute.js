const express = require('express');
const comissionRouter  = express.Router();
const {createCommission,getCommissionByItemId,updateCommissionById,getComStatusByItemId} = require('../controllers/comissionController');



comissionRouter.post('/create',createCommission); 
comissionRouter.put('/:id',updateCommissionById); 
comissionRouter.get('/:itemId',getCommissionByItemId)

// walid route 
comissionRouter.get('/status/:itemId',getComStatusByItemId);


module.exports={comissionRouter}