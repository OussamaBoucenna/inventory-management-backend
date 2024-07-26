const {Item} = require('./../models/item.model')
const ExcelJS = require('exceljs');



// const getItemBybarCode = async (req,res) => {
//   const itemBarCode = req.params.barCode ; 
//   console.log( `le barcode dans le body est ${itemBarCode}`)

//    try {
//      const itemTriBank = await Item.find({itemTriBank:itemBarCode})
//      if (itemTriBank.length != 0  ){
//       if (itemTriBank.length === 1) {
//         res.status(200).json({ item: itemTriBank[0] });
//       } else {
//         res.status(200).json({ items: itemTriBank });
//       }
//      }else{
//        const  itemAncienne = await Item.find({ancienneReference:itemBarCode})
//         if (itemAncienne.length != 0 ){
//           if (itemAncienne.length === 1) {
//             res.status(200).json({ item: itemAncienne[0] });
//           } else {
//             res.status(200).json({ items: itemAncienne });
//           }
//         }else{
//             res.status(404).json({message:"item not found"})
//         }
//      }
//    } catch (error) {
//      res.status(500).json({message:"Error in the server"})
//    }

// }  
const getItemByBarCode = async (req, res) => {
  const itemBarCode = req.params.barCode;
  console.log(`Le barcode dans le body est ${itemBarCode}`);
  try {
    // Recherche par itemTriBank et ancienneReference
    const items = await Item.find({
      $or: [
        { numeroImmobTribank: itemBarCode },
        { ancienneReference: itemBarCode },
      ],
    }).exec();

    if (items.length === 0) {
      res.status(404).json({ message: "Item not found" });
    } else if (items.length === 1) {
      res.status(200).json({ item: items[0] });
    } else {
      res.status(200).json({ items: items });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
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
   if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }
  
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const worksheet = workbook.worksheets[0];
  
      // Lire les données du fichier Excel
      const jsonData = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        if (rowNumber === 2) return;
        if (rowNumber === 3) return;
        if (rowNumber === 4) return;
        if (rowNumber === 5) return;
        if (rowNumber === 6) return;
        if (rowNumber === 7) return;
         var  ancienne =  row.getCell(2);
         
        jsonData.push({
          destination: row.getCell(1).value,
          ancienneReference: ancienne,
          numeroImmobTribank: row.getCell(3).value,
          designation :row.getCell(4).value,
          dateAquis:row.getCell(5).value,
          montentHorsTax:row.getCell(6).value,
          valImob:row.getCell(7).value,
          vnc:row.getCell(8).value, 
          observation:row.getCell(9).value,
          status:"noScan"
        });
      });
  
      // Importer les données dans MongoDB
      await Item.insertMany(jsonData);
  
      res.status(200).json({ message: 'Fichier importé avec succès' });
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
      const items = await Item.find().exec();
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

module.exports = {getItemByBarCode,updateItemBybarCode,importExcelToDataBase,exportDataBaseToExcel,createItem}