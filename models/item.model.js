const express = require('express'); 
const mongoose = require('mongoose')
const itemRouter = express.Router(); 

const itemSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true
      },
      ancienneReference: {
        type: String,
        required: false,
        default: '',
      },
      numeroImmobTribank: {
        type: String,
        required: true
      },
      designation : {
        type : String , 
        required:true , 
      },
      dateAquis :{
        type:String,
        required:false
      },
      montentHorsTax: {
        type:String,
        required:false,
        default:"0"
      },
      valImob:{
        type:String,
        required:false,
        default:"0"
      },
      vnc:{
        type:String,
        required:false,
        default:"0"
      },
      observation:{
        type:String,
        required:false,
        default:'/'
      },
      status:{
       type :String ,
       enum : ['scan','noScan'],
       required : true, 
      }
})

const Item =  mongoose.model('item',itemSchema); 


module.exports = {Item}