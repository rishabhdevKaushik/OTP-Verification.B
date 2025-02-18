import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import UserOtpVerification from "./models/UserOtpVerification.model.js";
import connectDB from "./connectMongo.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json()); // To read JSON
app.use(cors()); // Enable CORS from all domains
connectDB();

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

app.post("/otp", async (req, res) => {
    try {
        const { email, userId } = req.body;
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        const mailOptions = {
            to: email,
            subject: "Verify Email id",
            html: `<p>Enter <b>${otp}</b> in website to verify your email.</p><br><p>This code <b>expires in 15 minutes</b></p>`,
        };

        // Save hashed otp in mongoDB
        const hashedOtp = await bcrypt.hash(otp, 10);
        const newOtpVerification = await new UserOtpVerification({
            userId,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 15 * 60 * 1000, // 15Minutes
        });
        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);

        return res.status(200).send({ message: "Email sent" });
    } catch (error) {
        console.log(`Error while creating otp \n${error}`);
        return res.status(500).send({ message: "OTP not sent" });
    }
});

app.post("/verifyotp", async (req, res) => {
    try {
        const { otp, userId } = req.body;
        const UserOtpVerificationRecord = await UserOtpVerification.find({
            userId,
        });
        
        if (UserOtpVerificationRecord.length <= 0) {
            return res.status(400).send({ message: "User already verified or does not exist" });
        } else {
            const  expiresAt  = UserOtpVerificationRecord[0].expiresAt;
            const hashedOtp = UserOtpVerificationRecord[0].otp;

            if (expiresAt < Date.now()) {
                await UserOtpVerification.deleteMany({ userId });
                return res.status(400).send({ message: "Otp expired" });
            } else {
                const validOtp = await bcrypt.compare(otp, hashedOtp);

                if (!validOtp) {
                    return res
                        .status(400)
                        .send({ message: "Wrong otp, check again" });
                } else {
                    await UserOtpVerification.deleteMany({ userId });
                    return res
                        .status(200)
                        .send({ message: "User is now verified" });
                }
            }
        }
    } catch (error) {
        console.log(`Error while verifying otp \n${error}`);
        return res.status(500).send({ message: "OTP not verified" });
    }
});

app.listen(8080, () => {
    // console.log(`Server is running on port 8080`);
});
