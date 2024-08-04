const { DataTypes } = require('sequelize');
const {sequelize} = require('./../config/db.config'); 

const Item = sequelize.define('Item', {
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ancienneReference: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  numeroImmobTribank: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A' 
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateAquis: {
    type: DataTypes.STRING,
    allowNull: true
  },
  montentHorsTax: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0'
  },
  valImob: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0'
  },
  vnc: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0'
  },
  observation: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['scan', 'noScan']]
    }
  }
}, {
  hooks: {
    beforeSave: (item, options) => {
      if (typeof item.numeroImmobTribank === 'object') {
        item.numeroImmobTribank = "N/A";
      }
    }
  }
});

module.exports = {Item};