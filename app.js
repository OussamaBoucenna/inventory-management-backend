const express = require('express')
const app = express()
const {authRouter} = require('./routes/authRoute');
const { itemRouter } = require('./routes/itemRoute');
const { exportRouter } = require('./routes/exportRoute');
const {comissionRouter} = require('./routes/commissionRoute')
const {requireAuth} = require('./middleware/authMiddleware');
const {connectionToMySql} = require('./config/db.config');
const cors = require('cors');
const { statistiqueForUserRouter } = require('./routes/statistiqueUserRoute');
require('dotenv').config();


app.get('/',(req,res)=>{
    res.send('welcome to the server')
})
app.use(cors())
app.use(express.json())
app.use(authRouter);
app.use('/commission',requireAuth,comissionRouter) // il faut ajouter apres requireAuth
app.use('/item',requireAuth,itemRouter)
app.use('/stat-user',statistiqueForUserRouter)
app.use(exportRouter);


app.listen(5000,'0.0.0.0',()=>{
    
    connectionToMySql();
    console.log('The server is runnig on port 5000')
})



