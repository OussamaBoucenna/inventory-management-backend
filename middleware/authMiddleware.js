const jwt = require('jsonwebtoken')


const requireAuth =  (req,res,next) => {
  const token = req.headers.authorization  
  console.log(token)
  if(!token){
    return res.status(401).json({message : "il manque le token dans votre request"})
  }
  const header = token.split(' ')[1]
  
     jwt.verify(header,process.env.JWT_SECRET,(err,decodedToken)=>{
        if( err) {
            return res.status(401).json({message:"invalid token"})
        }
        req.user = decodedToken ; 
        next()
    })
    
}

const checkRole = (role) => (req,res,next) => {
   
     if (req.user.role != role){
      return res.status(403).json({message:"Acces denied"})
     }
     next();
}

module.exports = {requireAuth,checkRole}