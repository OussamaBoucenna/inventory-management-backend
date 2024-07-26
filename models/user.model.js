const mongoose = require('mongoose')
const {isEmail} = require('validator')
const bcrypt  = require('bcrypt')


const userSchema = new  mongoose.Schema({
   email :{
        type : String , 
        required :[true,'svp,entrer un e-mail'],
        unique:true , 
        lowercase:true,
        validate : [isEmail,'svp,entrer un e-mail valide']
   },
   password :{
        type:String,
        required : [true,'svp,enter un mots de passe'],
        minlength:[7 ,'la taille minimal du password est 7 caracteres']
   },
   role :{
     type : String  , 
     enum : ['superAdmin','admin','superUser','user'],
     required:true 
   },
   numAgence:{
     type : String , 
     required : false , 
   }
})

userSchema.statics.login = async function (email,password){
     const user = await this.findOne({email})

     if(user){
          const match = await bcrypt.compare(password,user.password)
           if(match){
               // le logine et reussit 
                 return user ; 
           }
           throw Error('incorrect password')
     }
     throw Error ('incorrect email')
}

userSchema.pre('save', async function (next){
     const salt = await bcrypt.genSalt()
     const hashedPassword  =await bcrypt.hash(this.password,salt)
     this.password = hashedPassword ; 
     next()
})

const User =  mongoose.model('user',userSchema)

module.exports = {User}; 