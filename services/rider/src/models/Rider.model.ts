import mongoose, { Document, Schema } from "mongoose";

export interface IRider extends Document {
  userId: string;
  picture: string;
  phone: string;
  adharNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  location: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
  };
  isAvailable: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema = new Schema<IRider>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    adharNumber: {
      type: String,
      required: true,
    },
    drivingLicenseNumber: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    isAvailable: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

RiderSchema.index({ location: "2dsphere" });

const Rider = mongoose.model<IRider>("Rider", RiderSchema);

export default Rider;
