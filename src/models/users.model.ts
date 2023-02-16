/* eslint-disable @typescript-eslint/no-empty-function */
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    'User',
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
          throw new Error('Do not try to set the `fullName` value!');
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        set(value) {
          const hashPassword = hashSync(value, genSaltSync(8));
          this.setDataValue('password', hashPassword);
        },
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.RefreshToken, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      sourceKey: 'id',
    });
    User.belongsToMany(models.Product, {
      through: 'ProductUser',
      foreignKey: 'userId',
      otherKey: 'product_id',
    });
    User.hasOne(models.Cart, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    User.hasOne(models.QuizScore, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    User.hasOne(models.Review, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    User.hasMany(models.Reply, {
      foreignKey: 'userId',
      sourceKey: 'id',
    });
    User.hasMany(models.Order);
    User.hasMany(models.CompleteQuiz, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    User.hasOne(models.LikeDislike, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
    User.hasMany(models.LiveStream, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };

  User.prototype.validPassword = (password) => {
    return compareSync(password, User.password);
  };

  return User;
};
