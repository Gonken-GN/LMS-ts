require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
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
// Send the activation code to the email address
export const registerationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const user: IRegisterationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-email.ejs"),
        data
      );
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account!",
          template: "activation-email.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to activate your account`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_CODE as Secret,
    { expiresIn: "1day" }
  );
  return { token, activationCode };
};

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

// Activate user and register it
export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_CODE as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        console.log(newUser.activationCode, activation_code);
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.user;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("User already exists", 404));
      }
      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Login controller
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password!", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Password does not match", 400));
      }

      sendToken(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Logout user
export const logout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
