import mongoose from "mongoose";

const UserOtpVerificationSchema = new mongoose.Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});

const UserOtpVerification = mongoose.model(
    "UserOtpVerificationSchema",
    UserOtpVerificationSchema
);
export default UserOtpVerification;
