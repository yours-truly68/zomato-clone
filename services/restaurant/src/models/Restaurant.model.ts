import mongoose, { Document, Schema } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: number;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude],
    formattedAddress: string;
  };
  isOpen: boolean;
  createdAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, "Please add a name for the restaurant"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please add an image for the restaurant"],
    },
    ownerId: {
      type: String,
      required: [true, "Please add an owner for the restaurant"],
    },
    phone: {
      type: Number,
      required: [true, "Please add a phone number for the restaurant"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    autoLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: {
        type: String,
        required: true,
      },
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

RestaurantSchema.index({ autoLocation: "2dsphere" });

const Restaurant = mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);


export default Restaurant;
