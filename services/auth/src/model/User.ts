import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
  image: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: [true, "Account with the email already exists"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
