import mongoose, { Schema } from "mongoose";
const AddressSchema = new Schema({
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
}, { timestamps: true });
AddressSchema.index({ location: "2dsphere" });
const Address = mongoose.model("Address", AddressSchema);
export default Address;
