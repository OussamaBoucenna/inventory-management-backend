const { error } = require("console");
const { User } = require("../models/user.model");
const {Commission} = require("./../models/commission.model");



const createCommission = async (req, res) => {
  const { itemId,userId,commission ,status } = req.body;

  if (!itemId || !commission) {
    return res.status(400).json({ message: "ItemId et userId sont requis." });
  }
  try {
    const commissionCreated = await Commission.create({itemId,userId ,commission,status});
    if (commissionCreated) {
      res.status(201).json({ commission: commissionCreated });
    } else {
      res.status(400).json({ message: "La commission n'a pas été créée." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur dans le serveur." });
    console.error(error); 
  }
};


// a revoire le update avec le id et non pas avec le item id 
const updateCommissionById = async (req,res)=>{
  const id = req.params.id ;
  const { status }  = req.body ; 
  // le front yb3tlna status , w yb3t IdUser,  DONE 
  // on va verifier est ce que le status est juste , sinon signaler une erreur else faire la procedure de mise a jour  //MAZALL
  const update = {
    status : status,
    userId : req.user.id, 
  }
  try {
      const commission = await Commission.findByIdAndUpdate(id,update,{new:true});
      if(commission){
        console.log(`commission updated ------------->  ${commission}`)
        res.status(200).json({commissionUpdated:commission})
      }else{
        res.status(404).json({message:"Erreur dans la mise à jour de la commission"})
      }
  } catch (error) {
    res.status(500).json({message:"Erreur dans le serveur",error:error.message})
  }
}
  // on doit faire une autre implementation pour la methode et l'integrer tout dabord avec le front en enfin sauter a la methode de upadate
// const getCommissionByItemId = async (req,res) =>{
//    const itemId = req.params.itemId ;
//    const idUser = req.user.id;
//    const user = await User.getUserById(idUser) 
//    const userCommision = user.commissionIn
//    try {
//       const commissionF = await Commission.find({itemId,commission:userCommision}); 
//        if (commissionF){
//         console.log(commissionF)
//         res.status(200).json({commission:commissionF[0]})
//        }else{
//         res.status(404).json({message:"commission n'est pas trouver"})
//        }
//    } catch (error) {
//       res.status(500).json({message:'erreur dans la recherche de la commision ',error:error.message})
//    }
// }

 // si c'a existe j'affiche le resultat 
 // sinon , je dois indiquer que ca n'existe pas ,apres si il la scan 
 // je verifier si la distination de item et numAgence sont egaux 
 // sinon , je dois afficher une alert dans le front pour indiquer que vous allez scanner une chose que ce n'est pas dans votre numAgence  
const getCommissionByItemId = async (req, res) => {
  const itemId = req.params.itemId;
  const idUser = req.user.id;

  try {
    // Récupération de l'utilisateur pour obtenir la commissionIn
    const user = await User.findByPk(idUser);
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }
    const userCommission = user.commissionIn;

    // Recherche de la commission par itemId et commissionIn
    const commissionF = await Commission.findOne({
      where: {
        itemId: itemId,
        commission: userCommission
      }
    });

    if (commissionF) {
      res.status(200).json({ commission: commissionF });
    } else {
      res.status(404).json({ message: "Commission not found" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving commission', error: error.message });
  }
};


//  walid methods 
const getComStatusByItemId = async (req, res) => {
  const itemId = req.params.itemId;
  // const commissionValue = req.body.commission;
  const commissionValue = req.query.commission || 1 ;

  try {
    // Recherche de la commission par itemId et commissionIn
    const commissionF = await Commission.findOne({
      where: {
        itemId: itemId,
        commission: commissionValue
      }
    });

    if (commissionF) {
      res.status(200).json({ commission: commissionF });
    } else {
      res.status(404).json({ message: "Commission not found" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving commission', error: error.message });
  }
};

module.exports = {createCommission,updateCommissionById,getCommissionByItemId,getComStatusByItemId};
