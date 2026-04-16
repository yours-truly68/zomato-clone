import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  restaurantId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    //check header for login token

    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - No Auth Header",
      });
      return;
    }
    const internalKey = req.headers["x-internal-key"];

    if (internalKey && internalKey === process.env.INTERNAL_SERVICE_KEY) {
      return next(); // ✅ allow internal services
    }

    // continue JWT validation...

    //verifying the extracted token

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Please Login - No Bearer Token",
      });
      return;
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Please Login - Invalid Token",
      });
      return;
    }

    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Please Login - Jwt Error",
    });
  }
};

export default isAuth;

export const isRider = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  if (user && user.role !== "rider") {
    res.status(403).json({
      message:
        "Access Denied -  Non Riders are not allowed to perform this action",
    });
    return;
  }

  next();
};
