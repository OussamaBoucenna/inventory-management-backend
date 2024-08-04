const { DataTypes } = require('sequelize');
const {sequelize} = require('./../config/db.config'); 
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'svp, entrer un e-mail valide'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [7],
        msg: 'la taille minimale du password est 7 caractères'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('superAdmin', 'admin', 'superUser', 'user'),
    allowNull: false
  },
  numAgence: {
    type: DataTypes.STRING
  },
  commissionIn: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0'
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.login = async function (email, password) {
  const user = await this.findOne({ where: { email } });

  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return user;
    }
    throw new Error('Incorrect password');
  }
  throw new Error('Incorrect email');
};

User.getUserById = async function (id) {
  const user = await this.findByPk(id);
  if (user) {
    return user;
  }
  throw new Error("User n'existe pas");
};

module.exports = {User};
 