import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  restaurantId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    //check header for login token from Jwt
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login -  No auth header",
      });
      return;
    }

    //extracting token from the header
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        message: "Please Login -  No bearer token",
      });
      return;
    }

    //verifying the extracting token
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Please Login -  Invalid Token",
      });
      return;
    }

    //sending user values to controller or next middleware
    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "JWT verification failed",
    });
  }
};

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        message: "Access Denied - Please Login",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied - Admins Only",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Authorization check failed - Admin Service - Please Login",
    });
  }
};
