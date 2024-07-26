const express = require('express')
const app = express()
const mongoose = require('mongoose') ;
 const {authRouter} = require('./routes/authRoute');
const { itemRouter } = require('./routes/itemRoute');
const { exportDataBaseToExcel } = require('./controllers/itemController');
const { exportRouter } = require('./routes/exportRoute');
const {requireAuth} = require('./middleware/authMiddleware')

app.get('/',(req,res)=>{
    res.send('welcome to the server')
})

app.use(express.json())
app.use(authRouter);
app.use('/item',requireAuth,itemRouter)
app.use(exportRouter);


// connect to the dataBase mongoDB
const dbURI = "mongodb+srv://sqmdkeojccnkqdn:xpmbacaAaWVfpVZa@za3tar.jwqnd4i.mongodb.net/?retryWrites=true&w=majority&appName=BDL_APP" ; 

mongoose.connect(dbURI, { useNewUrlParser: true }).then(
 (result) => {
    console.log("connected to the database");
    app.listen(5000,'0.0.0.0',()=>{
        console.log('the server is runnig on port 5000')
    })
}   
).catch((err)=>{
    console.log(err)
})



