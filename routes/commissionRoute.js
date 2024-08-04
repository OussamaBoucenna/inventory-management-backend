const express = require('express');
const comissionRouter  = express.Router();
const {createCommission,getCommissionByItemId,updateCommissionById} = require('../controllers/comissionController');



comissionRouter.post('/create',createCommission); 
comissionRouter.put('/:id',updateCommissionById); 
comissionRouter.get('/:itemId',getCommissionByItemId)


module.exports={comissionRouter}