import mongoose, { Schema } from "mongoose";
const RiderSchema = new Schema({
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
        unique: true,
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
            default: "Point"
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
}, {
    timestamps: true,
});
RiderSchema.index({ location: "2dsphere" });
const Rider = mongoose.model("Rider", RiderSchema);
export default Rider;
