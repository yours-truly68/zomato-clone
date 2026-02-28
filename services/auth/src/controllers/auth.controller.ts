import { Request, Response } from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middleware/trycatch.middleware.js";
import { AuthenticatedRequest } from "../middleware/isAuth.middleware.js";


//Login user controller-->
export const loginUser = TryCatch(async (req: Request, res: Response) => {
  const { name, email, picture } = req.body;

  let user = await User.findOne({ email }); //checks if user exist - via email since its unique

  //Create User if it doesnt exist
  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  //signs and creates a new token for authorization
  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });
  //user created
  res.status(201).json({
    message: "Login Successfull",
    user,
    token,
  });
});

//adding roles to the already logged in user
const allowedRoles = ["customer", "rider", "seller"];
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?._id) {
      return res.status(401).json({
        message: "Unauthorized!",
      });
    }

    const { role } = req.body as { role: Role };

    if (!allowedRoles.includes(role)) {
      return res.status(401).json({
        message: "Invalid Role",
      });
    }

    //finding user using the id
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { role },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    //re-sign the token for updating the role
    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
      expiresIn: "15d",
    });

    res.status(200).json({
      user,
      token,
    });
  },
);

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json(user);
  },
);
