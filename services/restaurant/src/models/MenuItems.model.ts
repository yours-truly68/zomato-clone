import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  isVeg: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

export const MenuItem: Model<IMenuItem> = mongoose.model<IMenuItem>(
  "MenuItem",
  MenuItemSchema,
);
