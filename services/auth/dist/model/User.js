import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
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
}, { timestamps: true });
const User = mongoose.model("User", UserSchema);
export default User;
