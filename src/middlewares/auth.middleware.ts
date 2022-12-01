import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import { SECRET_KEY } from "@config";
import DB from "@databases";
import { HttpException } from "@exceptions/HttpException";
import { DataStoredInToken, RequestWithUser } from "@interfaces/auth.interface";

const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["x-access-token"];

    if (token) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(
        token,
        secretKey
      ) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser = await DB.Users.findByPk(userId);

      if (findUser) {
        req.user?.id = findUser;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token"));
      }
    } else {
      next(new HttpException(404, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token"));
  }
};

export default authMiddleware;
