const nodemailer = require("nodemailer");
const crypto = require("crypto");
const OtpModel = require("../models/OtpModel.js");
const Student = require("../models/student.js")

// Send OTP
exports.sendOtp = async (req, res) => {
    try {
      const { email } = req.body;

      const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });

  
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const studentExists = await Student.findOne({ email });
      if (studentExists) {
        return res.status(400).json({ message: "Email ID already exists. Please log in." });
      }
  
      // Generate a 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();
  
      // Save OTP in DB (overwrite if exists)
      await OtpModel.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
      );
  
      // Email options
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP",
        text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
      };
  
      // Send email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  exports.verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
  
      const otpRecord = await OtpModel.findOne({ email });
  
      if (!otpRecord) {
        return res.status(400).json({ message: "OTP not found. Please request a new one." });
      }
  
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
  
      // Remove OTP after successful verification
       await OtpModel.deleteOne({ email });
  
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };