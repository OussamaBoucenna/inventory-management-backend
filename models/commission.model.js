const { DataTypes } = require('sequelize');
const {sequelize} = require('./../config/db.config'); 
const {Item} = require('./item.model');
const {User} = require('./user.model')


const Commission = sequelize.define('Commission', {
  itemId: {
    type: DataTypes.INTEGER,
    references: {
      model: Item,
      key: 'id'
    },
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id' 
    },
    defaultValue: 0
  },
  commission: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scan', 'noScan', 'annomalie'),
    defaultValue: 'noScan'
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      fields: ['itemId']
    }
  ]
});

module.exports = {Commission};
