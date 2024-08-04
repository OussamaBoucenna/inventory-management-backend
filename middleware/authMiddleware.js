const jwt = require('jsonwebtoken')
require('dotenv').config();

const requireAuth =  (req,res,next) => {
  // const token = req.headers.authorization  
  // console.log(token)
  // if(!token){
  //   return res.status(401).json({message : "il manque le token dans votre request"})
  // }
  // const header = token.split(' ')[1]
  
  //    jwt.verify(header,process.env.JWT_SECRET,(err,decodedToken)=>{
  //       if(err) {
  //           return res.status(401).json({message:"invalid token"})
  //       }
  //       console.log(process.env.JWT_SECRET)
  //       console.log(decodedToken.id);
        
  //       req.user = decodedToken ; 
  //       next()
  //   })
  const authHeader = req.headers.authorization;

  // Vérifiez que l'en-tête Authorization est présent et commence par "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Token manquant ou format invalide" });
  }

  // Extraire le token du header
  const token = authHeader.split(' ')[1];

  // Vérifiez et décodez le token
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide" });
    }
     console.log(decodedToken)
    // Ajouter les informations du token à la requête
    req.user = decodedToken;
    next();
  });
    
}

const checkRole = (role) => (req,res,next) => {
   
     if (req.user.role != role){
      return res.status(403).json({message:"Acces denied"})
     }
     next();
}

module.exports = {requireAuth,checkRole}