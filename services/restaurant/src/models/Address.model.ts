import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  userId: string;
  phone: number;
  formattedAddress: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      requireD: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true },
);

AddressSchema.index({ location: "2dsphere" });

const Address = mongoose.model<IAddress>("Address", AddressSchema);

export default Address;
