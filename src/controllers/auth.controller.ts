import { NextFunction, Request, Response } from "express";
import { RegisterUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { RequestWithUser } from "@interfaces/auth.interface";
import AuthService from "@services/auth.service";
import TokenService from "@/services/token.service";
import { RefreshToken } from "@/interfaces/refreshToken.interface";

class AuthController {
  public authService = new AuthService();
  public tokenService = new TokenService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: RegisterUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);
      const data = {
        id: signUpUserData.id,
        firstName: signUpUserData.firstName,
        lastName: signUpUserData.lastName,
        fullName: signUpUserData.fullName,
        email: signUpUserData.email,
      };
      res
        .status(200)
        .send({ data: signUpUserData, message: "Signed Up successfully." });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, cookie } = req.body;

      const { refreshToken, accessToken, user } = await this.authService.login({
        email,
        password,
        cookie,
      });

      res.status(200).json({
        accessToken,
        refreshToken,
        user,
        message: `Logged in Successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  public refreshTokenUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { refreshToken: requestToken } = req.body;

      if (requestToken === null) {
        return res.status(403).json({
          redirectToLogin: true,
          message: "Refresh Token is required!",
        });
      }
      let refreshTokenData: RefreshToken = await this.tokenService.findToken(
        requestToken
      );
      if (!refreshTokenData)
        res.status(403).json({
          message: "Invalid Token!",
        });
      let refreshTokenInvalid = await this.tokenService.verifyToken(
        refreshTokenData
      );
      if (refreshTokenInvalid) {
        res.status(403).json({
          message: "Expired Token!",
        });
        return;
      }
      const { accessToken, refreshToken, user } =
        await this.tokenService.refreshTokenUser(refreshTokenData);

      return res.status(200).json({ accessToken, refreshToken, user });
    } catch (error) {
      next(error);
    }
  };

  public verifyEmail = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { hash } = req.params;
      if (!hash) res.status(400).send({ message: "Invalid Request" });
      const logOutUserData: { message: string } =
        await this.authService.verifyEmail(hash);
      res.status(200).json({ message: logOutUserData.message });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
