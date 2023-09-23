require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "models/user.model";
import ErrorHandler from "utils/ErrorHandler";
import { CatchAsyncError } from "middleware/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";

interface IRegisterationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const registerationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (!isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const user: IRegisterationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() + 9000).toString();

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_CODE as Secret,
    { expiresIn: "5min" }
  );
  return { token, activationCode };
};
