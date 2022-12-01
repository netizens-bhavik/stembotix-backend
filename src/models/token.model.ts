import { v4 as uuidv4 } from "uuid";
module.exports = (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      token: {
        type: Sequelize.STRING,
      },
      expiryDate: {
        type: Sequelize.DATE,
      },
    },
    {
      paranoid: true,
    }
  );
  RefreshToken.createToken = async function (user) {
    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + 86400 * 2);

    let _token = uuidv4();

    let refreshToken = await this.create({
      token: _token,
      userId: user.id,
      expiryDate: expiredAt.getTime(),
    });
    return refreshToken.token;
  };

  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };
  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: "userId",
      targetKey: "id",
    });
  };

  return RefreshToken;
};
