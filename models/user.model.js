import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { type: String, required: true, enum: ["user", "admin"] },
    isFriend: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isFollowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profile: {
        bio: { type: String },
        profilePhoto: { type: String, default: "" },
        birthDate: { type: Date },
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
