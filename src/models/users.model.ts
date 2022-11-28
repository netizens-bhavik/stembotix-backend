/* eslint-disable @typescript-eslint/no-empty-function */
import { hashSync, genSaltSync, compareSync } from "bcrypt";
const PROTECTED_ATTRIBUTES = ["password"];
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
        set(value) {
          throw new Error("Do not try to set the `fullName` value!");
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
        },
      },
      // password: {
      //   type: Sequelize.STRING,
      //   set(value) {
      //     const hashPassword = hashSync(value, genSaltSync(8));
      //     this.setDataValue('password', hashPassword);
      //   },
      // },
    },
    {
      paranoid: true,
      // scopes: {
      //   withoutPassword: {
      //     attributes: { exclude: ['password'] },
      //   },
      // },
    }
  );

  User.associate = (models) => {
    // User.hasOne(models.Token);
    // User.hasMany(models.UserGroupMap);
    // User.belongsToMany(models.GroupMessages, { through: "SeenByUsers" });
    // User.hasMany(models.DirectMessages, { foreignKey: "sender_id" });
    // User.hasMany(models.DirectMessages, { foreignKey: "reciever_id" });
    // User.hasMany(models.User);
  };

  // User.prototype.validPassword = (password) => {
  //   return compareSync(password, User.password);
  // };

  return User;
};
