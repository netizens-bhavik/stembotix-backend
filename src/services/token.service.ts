import DB from "@databases";
import { HttpException } from "@/exceptions/HttpException";
import { SECRET_KEY } from "@config";
import { Token } from "@/interfaces/token.interface";
import { RefreshToken } from "@/interfaces/refreshToken.interface";
import { User } from "@interfaces/users.interface";
import { isEmpty } from "@/utils/util";
import { CreateTokenDto } from "@/dtos/token.dto";
import jwt from "jsonwebtoken";

export default class TokenService {
  public tokens = DB.Token;
  public refreshToken = DB.RefreshToken;
  public users = DB.User;

  public async findToken(reqToken: string): Promise<RefreshToken> {
    const tokenData = await this.refreshToken.findOne({
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

  public async refreshTokenUser(token: RefreshToken): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    const user = await this.users.findOne({
      where: { id: token.userId },
    });
    let newAccessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: 3600,
    });
    return {
      accessToken: newAccessToken,
      refreshToken: token.token,
      user: user,
    };
  }

  public async verifyToken(token: RefreshToken): Promise<Boolean> {
    const isInvalid: boolean = await this.refreshToken.verifyExpiration(token);
    return isInvalid;
  }
}
