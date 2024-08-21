const { Sequelize } = require('sequelize');
require('dotenv').config(); 

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         host: process.env.DB_HOST,
//         dialect: 'mysql',
//         port: process.env.DB_PORT,
//         logging: false,
//     }
// );
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT,
      logging: false,
      dialectOptions: {
        ssl: {
            require: true, // This ensures SSL is used
            rejectUnauthorized: false // Optional: set to true if you want to reject unauthorized certificates
        }
    }
  }
);

const connectionToMySql = async () => {
    console.log(process.env.DB_PASSWORD)
    try {
      await sequelize.authenticate();
      console.log('Connected to database');
      await sequelize.sync({ force: false }); // `force: true` supprime les tables existantes et les recrée
  
      
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  };

module.exports = {sequelize,connectionToMySql};

