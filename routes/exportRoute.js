const express = require('express');
const { exportDataBaseToExcel } = require('../controllers/itemController');
const { requireAuth, checkRole } = require('../middleware/authMiddleware');
const exportRouter = express.Router();


exportRouter.get('/export',requireAuth,exportDataBaseToExcel)

module.exports={exportRouter}