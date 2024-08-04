
//  CONVERTED TO MYSQL 

const {User} = require('../models/user.model')
require('dotenv').config();
const jwt = require('jsonwebtoken')

// une fonction qui cree le token a partire d'un id de l'utilisateur 
const createToken = (id,role) => {
    const tokenKey = process.env.JWT_SECRET ;
    return jwt.sign({id,role},tokenKey,{expiresIn:'1d'})
}
// il faut verifier l'existence d'un utilisateur 
const signupUser = async (req,res) => {
    const {email,password,role} = req.body ; 
    const numAgence = req.body.numAgence !== undefined ? req.body.numAgence : null ;
    const commissionIn = req.body.commissionIn !== undefined ? req.body.commissionIn : null ;
    console.log(email,password,role)

    try {
        const user = await User.findOne({where:{email}})
        if(!user){
            const userCreated = await User.create({email,password,role,numAgence,commissionIn})
              if(userCreated){
            const token = createToken(userCreated.id,userCreated.role)
            res.status(201).json({user:userCreated,token:token})
              }else{
                res.status(400).json({message:"Erreur dans la création de l'utilisateur"})
              }
        }else{
           res.status(400).json({message:"user with this email already exist",user:user})
        }
    } catch (error) {
        res.status(400).send('erreur,l utilisateur n est pas creer')
        console.log(error)
    }
}
  
const loginUser = async (req,res)=> {
     const {email,password} = req.body ; 
      
     try {
        const user = await User.login(email,password)
         const token = createToken(user.id,user.role); 
         console.log(user.role);
         res.status(200).json({user:user,token:token});
         
     } catch (error) {
        res.status(400).json({error:error.message})
     }
} 
const getCurrentUser = async(req,res)=> {
       
         const {id,role}  = req.user ; 
         console.log(id)
         try {
          const user = await User.getUserById(id);
          if (user){
            res.status(200).json({user:user})
          }else{
            res.status(404).json({message:"user n'est pas trouver"})
          }
         } catch (error) {
            res.status(500).json({message:"erreur dans le serveur",error:error.message})
         }

        
}



module.exports = {signupUser ,loginUser,getCurrentUser}; 