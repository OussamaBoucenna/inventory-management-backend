const {Item} = require('./../models/item.model')
const {Commission} = require('./../models/commission.model')
const ExcelJS = require('exceljs');
const {Op} = require('sequelize')


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
          destination: row.getCell(1).value,
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
        { header: 'Destination', key: 'destination' },
        { header: 'Ancienne référence', key: 'ancienne' },
        { header: 'N° immob TRIBANK', key: 'triBank' },
        { header: 'Désignation', key: 'designation' },
        { header: 'Date d\'acq', key: 'dateAquis' },
        { header: 'Mt HT d\'acq', key: 'montantHorsTaxe' },
        { header: 'VALEUR IMMOB', key: 'valImmob' },
        { header: 'valeur nette comptable VNC', key: 'vnc' },
        { header: 'OBS', key: 'obs' },
        { header: 'STATUS', key: 'status' },
      ];
      const items = await Item.aggregate(pipeline).exec();
      console.log(items)
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
          status:item.status
        });
        let fill;
        switch (item.status) {
          case 'noScan':
            fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Rouge pour noScan
            break;
          case 'scan':
            fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FF00' } }; // Vert pour scan
            break;
          default:
            fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // Blanc pour les autres statuts
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

module.exports = {getItemByBarCode,updateItemBybarCode,importExcelToDataBase,exportDataBaseToExcel,createItem}