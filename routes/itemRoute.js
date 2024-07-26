const express = require('express')
const { getItemByBarCode, updateItemBybarCode, importExcelToDataBase ,exportDataBaseToExcel, createItem } = require('../controllers/itemController')
const itemRouter = express.Router()
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



itemRouter.get('/:barCode',getItemByBarCode)
itemRouter.put('/:id',updateItemBybarCode) 
itemRouter.post('/import',upload.single('file'),importExcelToDataBase)
itemRouter.post('/create',createItem)
module.exports = {itemRouter}