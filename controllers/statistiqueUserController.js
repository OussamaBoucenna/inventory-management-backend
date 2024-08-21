
const {Item} = require('./../models/item.model')
const {Commission} = require('./../models/commission.model')
const {User}=require('./../models/user.model')
const  {sequelize} = require('./../config/db.config');
const { Console } = require('console');
const { serialize } = require('v8');


const getUserInfo = async (req,res) => {
    const {id} = req.user; 

    const user = await User.getUsersById(id); 
  
    try {
        const [results, metadata] = await sequelize.query(`
            SELECT commissions.id, commissions.status
            FROM commissions
            JOIN items ON commissions.itemId = items.id  
            WHERE ((commissions.commission=${user.commissionIn}) AND (commissions.userId=${id}) );
          `);    
          const userInfo = {
            numAgence : user.numAgence,
            userName:user.email,
            commission :user.commissionIn,
            scan: results.filter(item=> item.status==="scan").length,
            annomalie: results.filter(item=> item.status==="annomalie").length,
           }    
           console.log(userInfo)
       res.status(200).json({userinfo:userInfo})
    } catch (error) {
        console.error('Erreur lors de la récupération des commissions:', error);
        res.status(500).json({message:"Erreur dans la recuperation des commissions "})
      }
}
const getAgenceInfo = async (req,res) => {
    const {id} = req.user;    
    const user = await User.getUsersById(id); 
  
    try {
        const [results, metadata] = await sequelize.query(`
           SELECT commissions_subquery.*,(select count(*) from items where items.destination = ${user.numAgence} ) as "numTotal"
            FROM (
                SELECT id
                FROM items
                WHERE items.destination = ${user.numAgence}
            ) AS items_subquery
            JOIN (
                SELECT id AS idCommission,itemId ,status
                FROM commissions
                WHERE commissions.commission = ${user.commissionIn}
            ) AS commissions_subquery
            ON items_subquery.id = commissions_subquery.itemId;
          `);    
          const scane = results.filter(item=> item.status==="scan").length 
          const annomaliee = results.filter(item=> item.status==="annomalie").length
          const agenceInfo = {
            agence:user.numAgence,
            commission :user.commissionIn,
            scan: scane,
            annomalie:annomaliee,
            noScan : parseInt(results[1].numTotal,10) - parseInt(scane,10) - parseInt(annomaliee,10)
           }    
          //  console.log(results[0].numTotal)
          //  console.log(agenceInfo)
       res.status(200).json({agenceInfo:agenceInfo})
    } catch (error) {
        console.error('Erreur lors de la récupération des commissions:', error);
        res.status(500).json({message:"Erreur dans la recuperation des commissions "})
      }
}

 const getArticleScanAgence = async(req,res)=> {
    // cette requete retourne tout les aritcle scanner dans l'agence dans l'aquelle l'utilisateur appartient
    const {id} = req.user; 
    const user = await User.getUsersById(id);

     try {
        const [results,metadata] = await sequelize.query(`
               select new_commissions.status,new_commissions.createdAt,new_commissions.email,new_commissions.numAgence ,
                    new_items.ancienneReference,new_items.numeroImmobTribank,new_items.designation
                from 
                (select commissions.itemId,commissions.status,commissions.createdAt,users.email,users.numAgence
                from 
                (SELECT itemId,userId ,status,createdAt
                FROM commissions
                WHERE commissions.commission = ${user.commissionIn})as commissions 
                join users on commissions.userId = users.id) as new_commissions
                
                join 
                ( select id ,ancienneReference,numeroImmobTribank,designation 
                from  items where destination = ${user.numAgence} ) as new_items
                on  new_commissions.itemID = new_items.id
                
            `)
            if (results){
                res.status(200).json({items:results,agence:user.numAgence})
            }else {
                res.status(400).json({message:"erreur dans la recupuration des donner de l'agence"})
            }
     } catch (error) {
        
     }
}



const getAgenceInfoGeneral = async (req, res) => {
    console.log('le route est')
    try {
      const limit = parseInt(req.query.limit) || 20; // Nombre d'éléments à récupérer, par défaut 20
      const offset = parseInt(req.query.offset) || 0; // Décalage (pour les pages suivantes)     
      const [listAgence] = await sequelize.query(`
        SELECT DISTINCT destination
        FROM items
        LIMIT ${limit}
        OFFSET ${offset}
      `);
      let listAgenceInfo = [];
  
      await Promise.all(listAgence.map(async (agence) => {
        const [results, metadata] = await sequelize.query(`
          SELECT COUNT(*) AS nbItems
          FROM items
          WHERE destination = ${sequelize.escape(agence.destination)}
        `);
        listAgenceInfo.push({
          numAgence: agence.destination,
          nbItems: results[0].nbItems
        });
      }));
      // console.log("la liste d'agence info ",listAgenceInfo)
      res.status(200).json({ data: listAgenceInfo });
    } catch (error) {
      console.error('Error in getAgenceInfoGeneral:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const  getAgenceDetailsAllCommission = async (req,res) => {
    const numAgence = req.params.numAgence;
    const commissions = [1, 2, 3];
    const agenceInfoList = [];
    try {
    for (const commission of commissions) {
    const query = `
       SELECT commissions_subquery.*,
            (SELECT COUNT(*) FROM items WHERE items.destination = ${numAgence}) AS "numTotal"
        FROM (
          SELECT id
          FROM items
          WHERE items.destination = ${numAgence}
          ) AS items_subquery
        JOIN (
         SELECT id AS idCommission, itemId, status
         FROM commissions
         WHERE commissions.commission = "${commission}"
        ) AS commissions_subquery
        ON items_subquery.id = commissions_subquery.itemId;
      `;

  const [results] = await sequelize.query(query); // Assurez-vous d'utiliser votre méthode d'exécution SQL
  if (results.length > 0 && results[0].numTotal !== undefined) {
    const scane = results.filter(item => item.status === "scan").length;
    const annomaliee = results.filter(item => item.status === "annomalie").length;

    const agenceInfo = {
      scan: scane,
      annomalie: annomaliee,
      noScan: parseInt(results[0].numTotal, 10) - scane - annomaliee
    };

    agenceInfoList.push(agenceInfo);
  } else {

    const [results] = await sequelize.query(`
           SELECT COUNT(*) as numTotal from items where items.destination = ${numAgence}
       `)
    agenceInfoList.push({
      scan: 0,
      annomalie: 0,
      noScan: results[0].numTotal
    });
  }
    } 
      res.status(200).json({listAgence:agenceInfoList})

    }catch(error){
      res.status(500).json({message:error.message})
    }
  }


module.exports = {getUserInfo,getAgenceInfo,getArticleScanAgence,getAgenceInfoGeneral,getAgenceDetailsAllCommission}