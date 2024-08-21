const {Item} = require('./../models/item.model')
const {Commission} = require('./../models/commission.model')
const ExcelJS = require('exceljs');
const {Op} = require('sequelize')
const  {sequelize} = require('./../config/db.config')


const getItemByBarCode = async (req, res) => {
  const itemBarCode = req.params.barCode;
  console.log(`Le barcode dans le body est ${itemBarCode}`);

  try {
    const items = await Item.findAll({
      where: {
        [Op.or]: [
          { numeroImmobTribank: itemBarCode },
          { ancienneReference: itemBarCode }
        ]
      }
    });

    if (items.length === 0) {
      res.status(404).json({ message: "Item not found" });
    } else if (items.length === 1) {
      res.status(200).json({ item: items[0] });
    } else {
      res.status(200).json({ items: items });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// initule doka 
const updateItemBybarCode = async (req,res) => {
     const itemId = req.params.id ; 
     const update = req.body; 

     try {
        const itemUpdated = await Item.findByIdAndUpdate(itemId,update);
        if (itemUpdated){
            res.status(200).json({item:itemUpdated})
         }else{
            res.status(404).json({message:"item not updated"})
         }
     } catch (error) {
        res.status(500).json({message:"Error in the server"})
     }

} 
 
 const createItem = async (req,res)=> {
  const {destination,ancienneReference,numeroImmobTribank,designation,dateAquis,montentHorsTax,valImob,vnc,observation,status} = req.body; 

  try {
      const itemCreated =  await Item.create({destination,ancienneReference,numeroImmobTribank,designation,dateAquis,montentHorsTax,valImob,vnc,observation,status})
      if(itemCreated){
        res.status(200).json({item:itemCreated})
      }else{
        res.status(404).json({message:"item not created "})
      }
  } catch (error) {
    res.status(500).json({message:"erreur dans le serveur "})    
  }
 }
 function cleanNumber(number) {
  const numStr = number.toString();
  return numStr.replace(/^0+/, '');
}
const importExcelToDataBase = async (req,res) => {
   console.log("begin import excel to dataBase")
   if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }
  
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];
  
      const jsonData = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 7) return; // Skip header and initial rows
      
        jsonData.push({
          destination: cleanNumber( row.getCell(1).value),
          ancienneReference:  (row.getCell(2).value || '').toString(), 
          numeroImmobTribank: row.getCell(3).value,
          designation: row.getCell(4).value,
          dateAquis: row.getCell(5).value,
          montentHorsTax: row.getCell(6).value,
          valImob: row.getCell(7).value,
          vnc: row.getCell(8).value,
          observation: row.getCell(9).value,
          status: "noScan"
        });
      });
  
      await Item.bulkCreate(jsonData);
      res.status(200).json({message:"fichier impporté avec succés"})
      console.log('Fichier importé avec succès');
      // await createCommissionsForItems(); // apres on doit elever cette ligne car on doit pas cree tout les commissions a la fois , on doit les creer on fure et a mesure que l'utilisateur scan le codebare 
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de l\'importation du fichier' });
    }
} 

 const exportDataBaseToExcel = async(req,res) =>  {
   try {
      // Créer une nouvelle instance de Workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
  
      // Ajouter les en-têtes
      worksheet.columns = [
        { header: 'Destination', key: 'destination',width: 10 },
        { header: 'Ancienne référence', key: 'ancienne',width: 20 },
        { header: 'N° immob TRIBANK', key: 'triBank',width: 20 },
        { header: 'Désignation', key: 'designation',width : 45  },
        { header: 'Date d\'acq', key: 'dateAquis', width:22 },
        { header: 'Mt HT d\'acq', key: 'montantHorsTaxe',width:20},
        { header: 'VALEUR IMMOB', key: 'valImmob',width:20 },
        { header: 'valeur nette comptable VNC', key: 'vnc',width:20 },
        { header: 'OBS', key: 'obs' ,width:20},

         // Colonnes pour les commissions de type 1
       { header: 'Nom Utilisateur 1', key: 'nameUser1',width:20 },
        { header: 'Numéro Agence 1', key: 'NumAgence1',width:10 },
        { header: 'Statut 1', key: 'status1' ,width:12 },
        { header: 'Date 1', key: 'date1',width:15 },

      // Colonnes pour les commissions de type 2
        { header: 'Nom Utilisateur 2', key: 'nameUser2' },
        { header: 'Numéro Agence 2', key: 'NumAgence2' },
        { header: 'Statut 2', key: 'status2' },
        { header: 'Date 2', key: 'date2' },

  // Colonnes pour les commissions de type 3
        { header: 'Nom Utilisateur 3', key: 'nameUser3' },
        { header: 'Numéro Agence 3', key: 'NumAgence3' },
        { header: 'Statut 3', key: 'status3' },
        { header: 'Date 3', key: 'date3' },

      ];
      const [items, metadata] = await sequelize.query(sql);
      items.forEach(item => {
        const row = worksheet.addRow({
          destination: item.destination,
          ancienne: item.ancienneReference,
          triBank: item.numeroImmobTribank,
          designation:item.designation,
          dateAquis:item.dateAquis,
          montantHorsTaxe:item.montentHorsTax,
          valImmob:item.valImob,
          vnc:item.vnc,
          obs:item.observation,

          // Colonnes pour les commissions de type 1
          nameUser1: item.nameUser1,
          NumAgence1: item.NumAgence1,
          status1: item.status1,
          date1: item.date1,

            // Colonnes pour les commissions de type 2
          nameUser2: item.nameUser2,
          NumAgence2: item.NumAgence2,
          status2: item.status2,
          date2: item.date2,

          // Colonnes pour les commissions de type 3
          nameUser3: item.nameUser3,
          NumAgence3: item.NumAgence3,
          status3: item.status3,
          date3: item.date3,
        });
        let fill;
            
          if (item.status1 === "scan"){
            fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Vert pour scan
          }else if (item.status1 ==="annomalie"){
              if (item.status2 ==="scan"){
                fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Vert pour scan
              }else {
                //  annomalie
                fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Jaune orangé
              }
          }else if (item.status1 ==="noScan"){ // status1 = noScan 
            if (item.status2 ==="scan"){
              fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Vert pour scan
            }else if (item.status2==="noScan") {
              fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Rouge pour noScan
            }else{
                // annomalie
                fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Jaune orangé
            }
          }else{
            if (item.status2 ==="scan"){
              fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Vert pour scan
            }else if (item.status2 === "noScan"){
              fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Rouge pour noScan
            }else if(item.status2 === "annomalie"){
              fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Jaune orangé
            }else {
              // fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // Blanc

            }
          }
        row.eachCell(cell => {
          cell.fill = fill;
        });
      });
      res.setHeader('Content-Disposition', 'attachment; filename="INVETAIRE_BDL.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).send('Error generating Excel file');
      console.error(err);
    }
 }  
 



 const createCommissionsForItems = async () => {
  try {
    const items = await Item.findAll();
    const commissions = items.flatMap(item => [
      {
        itemId: item.id,
        userId: 1, 
        commission: '1'
      },
      {
        itemId: item.id,
        userId:2,
        commission: '2',
      }
    ]);

    await Commission.bulkCreate(commissions);
    console.log('Commissions créées avec succès pour chaque item.');
  } catch (error) {
    console.error('Erreur lors de la création des commissions :', error);
  }
};

// WALID METHODE  ------------------------------------------------------
   
const getStats = async (req, res) => {

  try {
    
    const [nbItems] = await sequelize.query(`SELECT COUNT(*) AS nbItems FROM items`);
    const [nbUserAccount] = await sequelize.query(`SELECT COUNT(*) AS nbUserAccount FROM users`);
    const [nbScanCom1] = await sequelize.query(`SELECT COUNT(*) AS nbScanCom1 FROM commissions WHERE commissions.commission = '1'`);
    const [nbScanCom2] = await sequelize.query(`SELECT COUNT(*) AS nbScanCom2 FROM commissions WHERE commissions.commission = '2'`);
    const [nbScanCom3] = await sequelize.query(`SELECT COUNT(*) AS nbScanCom3 FROM commissions WHERE commissions.commission = '3'`);
    // const [nbNoScan] = await db.query("SELECT COUNT(*) AS NbNoScan FROM items WHERE statut = 'Non Scanné'");
    
    const [nbScanSAcom1] = await sequelize.query(`SELECT COUNT(*) AS nbScanSAcom1 FROM commissions WHERE commissions.commission = '1' AND commissions.status = 'scan'`);
    const [nbScanAAcom1] = await sequelize.query(`SELECT COUNT(*) AS nbScanAAcom1 FROM commissions WHERE commissions.commission = '1' AND commissions.status = 'annomalie'`);
    const [nbScanSAcom2] = await sequelize.query(`SELECT COUNT(*) AS nbScanSAcom2 FROM commissions WHERE commissions.commission = '2' AND commissions.status = 'scan'`);
    const [nbScanAAcom2] = await sequelize.query(`SELECT COUNT(*) AS nbScanAAcom2 FROM commissions WHERE commissions.commission = '2' AND commissions.status = 'annomalie'`);
    const [nbScanSAcom3] = await sequelize.query(`SELECT COUNT(*) AS nbScanSAcom3 FROM commissions WHERE commissions.commission = '3' AND commissions.status = 'scan'`);
    const [nbScanAAcom3] = await sequelize.query(`SELECT COUNT(*) AS nbScanAAcom3 FROM commissions WHERE commissions.commission = '3' AND commissions.status = 'annomalie'`);
     

    res.status(200).json({
      nbItems: nbItems[0].nbItems,
      nbUserAccount:nbUserAccount[0].nbUserAccount,
      nbScanCom1: nbScanCom1[0].nbScanCom1,
      nbScanCom2: nbScanCom2[0].nbScanCom2,
      nbScanCom3: nbScanCom3[0].nbScanCom3,
        //==============================
      nbScanSAcom1: nbScanSAcom1[0].nbScanSAcom1, 
      nbScanAAcom1 : nbScanAAcom1[0].nbScanAAcom1,
      nbScanSAcom2: nbScanSAcom2[0].nbScanSAcom2,
      nbScanAAcom2 : nbScanAAcom2[0].nbScanAAcom2,
      nbScanSAcom3: nbScanSAcom3[0].nbScanSAcom3,
      nbScanAAcom3 : nbScanAAcom3[0].nbScanAAcom3
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).send('Server error');
  }
};


const getAllItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;

  const { commission, agence, statut, year } = req.query;

  let filterConditions = [];
  if (commission) filterConditions.push(`commissions.commission = '${commission}'`);
  if (agence) filterConditions.push(`items.destination = '${agence}'`);
  if (statut) filterConditions.push(`commissions.status = '${statut}'`);
  if (year) filterConditions.push(`YEAR(items.dateAquis) = '${year}'`);

  const filterQuery = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

  try {
    // Count total items with applied filters
    const totalItemsQuery = filterConditions.length > 0 ? `
      SELECT COUNT(*) as count
      FROM items,commissions
      ${filterQuery} AND commissions.itemId = items.id` : `
      SELECT COUNT(*) as count
      FROM items 
      LEFT JOIN commissions ON commissions.itemId = items.id
      ${filterQuery}
    `;
    const [totalItems] = await sequelize.query(totalItemsQuery);
    const totalPages = Math.ceil(totalItems[0].count / pageSize);
    const offset = totalPages === 1 ? 0 : (page - 1) * pageSize;
    // const testqr = `SELECT items.destination, items.ancienneReference, items.numeroImmobTribank, items.designation, items.observation
    //    FROM items,commissions
    //    ${filterQuery} AND commissions.itemId = items.id
    //    LIMIT ${pageSize} OFFSET ${offset}`
    //   console.log(testqr);
    
    // Fetch filtered items with pagination
    const [items, metadata] = filterConditions.length > 0 ? await sequelize.query(
      `SELECT items.destination, items.ancienneReference, items.numeroImmobTribank, items.designation, items.observation
       FROM items,commissions
       ${filterQuery} AND commissions.itemId = items.id
       LIMIT ${pageSize} OFFSET ${offset}`
    ) : await sequelize.query(
      `SELECT items.destination, ancienneReference, numeroImmobTribank, items.designation, items.observation
       FROM items 
       LEFT JOIN commissions ON commissions.itemId = items.id 
       ${filterQuery}
       LIMIT ${pageSize} OFFSET ${offset}`
    );

    // Count total items with applied filters

    if (items.length === 0) {
      return res.status(404).json({ message: "No items found" });
    }

    res.status(200).json({
      items: items,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getAllNoScanItems = async (req, res) => {
  try {
    // Get page and pageSize from query parameters, defaulting to page 1 and 100 items per page if not provided
    const { page = 1, pageSize = 100 } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Count total items with applied filters, excluding those with a commission
    const totalItemsQuery = `
      SELECT COUNT(*) as count
      FROM items
      LEFT JOIN commissions ON commissions.itemId = items.id
      WHERE commissions.itemId IS NULL
    `;
    const [totalItems] = await sequelize.query(totalItemsQuery);

    // Fetch filtered items without a commission with pagination
    const itemsQuery = `
      SELECT items.destination, items.ancienneReference, items.numeroImmobTribank, items.designation, items.observation
      FROM items
      LEFT JOIN commissions ON commissions.itemId = items.id
      WHERE commissions.itemId IS NULL
      LIMIT :limit OFFSET :offset
    `;
    const [items] = await sequelize.query(itemsQuery, {
      replacements: { limit: parseInt(pageSize), offset: parseInt(offset) },
    });

    if (items.length === 0) {
      return res.status(404).json({ message: "No items found" });
    }

    res.status(200).json({
      items,
      totalItems: totalItems[0].count,
      totalPages: Math.ceil(totalItems[0].count / pageSize),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
 
 
//******************************************************************* */

module.exports = {getItemByBarCode,updateItemBybarCode,importExcelToDataBase,exportDataBaseToExcel,createItem,getStats,getAllItems,getAllNoScanItems}








const sql = `
    SELECT
        destination, ancienneReference, numeroImmobTribank, designation, dateAquis, montentHorsTax, valImob, vnc, observation,
        nameUser1, NumAgence1, status1, date1,
        nameUser2, NumAgence2, status2, date2,
        nameUser3, NumAgence3, status3, date3
    FROM
        items
    JOIN (
        SELECT
            items.id AS itemId,
            MAX(CASE WHEN commissions.commission = 1 THEN commissions.nameUser END) AS nameUser1,
            MAX(CASE WHEN commissions.commission = 1 THEN commissions.agence END) AS NumAgence1,
            MAX(CASE WHEN commissions.commission = 1 THEN commissions.status END) AS status1,
            MAX(CASE WHEN commissions.commission = 1 THEN commissions.date END) AS date1,
            MAX(CASE WHEN commissions.commission = 2 THEN commissions.nameUser END) AS nameUser2,
            MAX(CASE WHEN commissions.commission = 2 THEN commissions.agence END) AS NumAgence2,
            MAX(CASE WHEN commissions.commission = 2 THEN commissions.status END) AS status2,
            MAX(CASE WHEN commissions.commission = 2 THEN commissions.date END) AS date2,
            MAX(CASE WHEN commissions.commission = 3 THEN commissions.nameUser END) AS nameUser3,
            MAX(CASE WHEN commissions.commission = 3 THEN commissions.agence END) AS NumAgence3,
            MAX(CASE WHEN commissions.commission = 3 THEN commissions.status END) AS status3,
            MAX(CASE WHEN commissions.commission = 3 THEN commissions.date END) AS date3
        FROM
            items
        LEFT JOIN (
            SELECT
                commissions.*,
                users.numAgence AS agence,
                users.email AS nameUser
            FROM
                commissions
            JOIN users ON commissions.userId = users.id
        ) AS commissions ON items.id = commissions.itemId
        GROUP BY items.id
    ) AS com ON items.id = com.itemId
  `;