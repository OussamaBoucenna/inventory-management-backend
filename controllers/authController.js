
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
        res.status(500).send('erreur,l utilisateur n est pas creer')
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
          const user = await User.getUsersById(id);
          if (user){
            res.status(200).json({user:user})
          }else{
            res.status(404).json({message:"user n'est pas trouver"})
          }
         } catch (error) {
            res.status(500).json({message:"erreur dans le serveur",error:error.message})
         }   
}

 const getUsers = async (req,res) => {
     try {
      const users = await User.findAll({});
      res.status(200).json({users:users})
     }catch(e){
      res.status(500).json({message:"erreur interne,serveur ne répond pas "})
     }
 }

 const updateUserDetails = async (req,res) => {
   const {newDetails} = req.body;
   const id = req.params.id ; 
  try {
    const updatedUser = await User.updateUser(id, newDetails);
    console.log('Utilisateur mis à jour:', updatedUser);
    res.status(200).json({user:updatedUser})
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error.message);
    res.status(400).json({err:error.message})
  }
}

const getUserById = async (req,res) => {
  const id  = req.params.id
   
  try {
    const user  = await User.getUsersById(id);
   
    if (user){
      res.status(200).json({user:user})
    }else {
      res.status(404).json({message:"user n'est pas trouver "})

    }
  } catch (error) {
    res.status(500).json({message:"erreur dans le serveur"})
     }
}



module.exports = {signupUser ,loginUser,getCurrentUser,getUsers,updateUserDetails,getUserById}; 