const {User} = require('../models/user.model')
require('dotenv').config();
const jwt = require('jsonwebtoken')

// une fonction qui cree le token a partire d'un id de l'utilisateur 
const createToken = (id,role) => {
    const tokenKey = process.env.JWT_SECRET ;
    return jwt.sign({id,role},tokenKey,{expiresIn:'1d'})
}

const signupUser = async (req,res) => {
    const {email,password,role} = req.body ; 
    const numAgence = req.body.numAgence !== undefined ? req.body.numAgence : null ;
    console.log(email,password,role)
    try {
         const userCreated = await User.create({email,password,role,numAgence})
         const token = createToken(userCreated._id,userCreated.role)
         res.status(201).json({user:userCreated,token:token})
    } catch (error) {
        res.status(400).send('erreur,l utilisateur n est pas creer')
        console.log(error)
    }
}
  
const loginUser = async (req,res)=> {
    console.log("login user begin ")
     const {email,password} = req.body ; 
      
     try {
        const user = await User.login(email,password)
         const token = createToken(user._id,user.role); 
         console.log(user.role);
         res.status(200).json({user:user,token:token});
         
     } catch (error) {
        res.status(400).json({error:error.message})
     }
}



module.exports = {signupUser ,loginUser}; 