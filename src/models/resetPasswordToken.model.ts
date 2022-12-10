import { v4 as uuidv4 } from 'uuid';
import { User } from '@interfaces/users.interface';
module.exports = (sequelize, Sequelize) => {
  const ResetPasswordToken = sequelize.define(
    'ResetPasswordToken',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );
  ResetPasswordToken.createToken = async function (token: string, user: User) {
    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + 60 * 60);

    let refreshToken = await this.create({
      hash: token,
      user_id: user.id,
      expiryDate: expiredAt.getTime(),
    });
    return refreshToken.token;
  };
  ResetPasswordToken.verifyToken = async function (token) {
    return token.expiryDate.getTime() < new Date().getTime();
  };
  return ResetPasswordToken;
};
