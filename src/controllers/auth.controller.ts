import { NextFunction, Request, Response } from "express";
import { RegisterUserDto } from "@dtos/users.dto";
import { User } from "@interfaces/users.interface";
import { RequestWithUser } from "@interfaces/auth.interface";
import AuthService from "@services/auth.service";
import TokenService from "@/services/token.service";

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
      res.status(200).send({ data: signUpUserData, message: "signup" });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cookie } = req.cookies;
      const { email, password } = req.body;

      const { accessToke, ...findUser } = await this.authService.login({
        email,
        password,
        cookie,
      });

      res.cookie("refreshToken", accessToke);

      res.status(200).json({ data: findUser, message: `login` });
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
      let refreshTokenData = await this.tokenService.findToken(requestToken);

      if (!refreshTokenData) {
        res.status(403).json({
          redirectToLogin: true,
          message: "Refresh token is not in database!",
        });
      }

      const [statusCode, { accessToken, ...response }] =
        await this.tokenService.refreshTokenUser(refreshTokenData);

      res.cookie("refreshToken", accessToken);
      return res.status(statusCode).json({ accessToken, ...response });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.authService.logout(userData);

      res.setHeader("Set-Cookie", ["Authorization=; Max-age=0"]);
      res.status(200).json({ data: logOutUserData, message: "logout" });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
