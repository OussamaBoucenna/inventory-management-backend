const express = require('express')
const { getItemByBarCode, updateItemBybarCode, importExcelToDataBase ,exportDataBaseToExcel, createItem } = require('../controllers/itemController')
const itemRouter = express.Router()
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



itemRouter.get('/:barCode',getItemByBarCode) // done 
itemRouter.put('/:id',updateItemBybarCode)  // noneed because there will be no status in the item value  
itemRouter.post('/import',upload.single('file'),importExcelToDataBase) // im in 
itemRouter.post('/create',createItem)
module.exports = {itemRouter}