import DB from "@databases";
import { HttpException } from "@/exceptions/HttpException";
import { SECRET_KEY } from "@config";
import { Token } from "@/interfaces/token.interface";
import { isEmpty } from "@/utils/util";
import { CreateTokenDto } from "@/dtos/token.dto";
import jwt from "jsonwebtoken";

export default class TokenService {
  public tokens = DB.Token;
  public refreshToken = DB.RefreshToken;
  public users = DB.User;

  public async findToken(reqToken: string): Promise<Token> {
    const tokenData: Token = await this.refreshToken.findOne({
      where: { token: reqToken },
    });

    return tokenData;
  }

  public async createOrUpdateTokenUser(
    tokenData: CreateTokenDto
  ): Promise<Token> {
    if (isEmpty(tokenData)) throw new HttpException(400, "tokenData is empty");
    const createUserData: Token = await this.tokens.upsert({ ...tokenData });
    return createUserData;
  }

  public async refreshTokenUser(token: CreateTokenDto): Promise<Token> {
    let code = 200;
    let response = {};
    if (this.refreshToken.verifyExpiration(token)) {
      this.refreshToken.destroy({ where: { id: token.token } });
      code = 403;
      response = {
        messages: "Refresh token was expired. Please make a new signin request",
        redirectToLogin: true,
      };
      return response;
    } else {
      const user = await this.users.findOne({
        where: { id: token.userId },
      });
      let newAccessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
        expiresIn: 3600,
      });
      response = {
        redirectToLogin: false,
        accessToken: newAccessToken,
        refreshToken: token?.token,
      };
    }
    return [code, response];
  }
}
