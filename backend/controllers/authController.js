// backend/controllers/authController.js
// ============================================
// AUTH CONTROLLER - with email verification
// ============================================

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

// ============================================
// LOAD LOGO AS BASE64 - so it always shows in email
// ============================================
const logoPath = path.join(__dirname, "../public/images/Logo.jpg");
const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`
  : null;

// ============================================
// PASSWORD VALIDATION - 8-16 chars, uppercase, lowercase, number, special
// ============================================
const validatePassword = (password) => {
  if (password.length < 8 || password.length > 16) {
    return { valid: false, message: "Password must be 8 to 16 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least 1 uppercase letter (A-Z)" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least 1 lowercase letter (a-z)" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least 1 number (0-9)" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least 1 special character (!@#$%^&*)" };
  }
  return { valid: true };
};

// ============================================
// SEND VERIFICATION EMAIL
// ============================================
const sendVerificationEmailFunc = async (email, name, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
  
  const verificationHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <div style="background: #f0f9ff; padding: 48px 32px 32px; text-align: center;">
        <div style="width: 80px; height: 80px; margin: 0 auto 24px;">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Catherine's Oasis" style="width: 100%; height: auto; display: block; border-radius: 16px;">` : `<div style="width:80px;height:80px;background:#0284c7;border-radius:16px;"></div>`}
        </div>
        <h1 style="margin: 0; color: #0c4a6e; font-size: 28px; font-weight: 600;">Catherine's Oasis</h1>
      </div>
      <div style="padding: 40px 32px; background: #ffffff;">
        <h2 style="margin: 0 0 12px; color: #0c4a6e; font-size: 20px;">Welcome, ${name}!</h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
          Please verify your email address to complete your registration.
        </p>
        <div style="text-align: center; margin: 0 0 32px;">
          <a href="${verificationLink}" style="background: #0284c7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 16px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="margin: 0 0 32px; color: #64748b; font-size: 14px; text-align: center;">
          This link will expire in <strong>24 hours</strong>.
        </p>
        <div style="height: 1px; background: #e2e8f0; margin: 0 0 24px;"></div>
        <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
          Catherine's Oasis · 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    email: email,
    subject: "Verify Your Email - Catherine's Oasis",
    html: verificationHtml
  });
};

// ============================================
// SEND WELCOME EMAIL (after verification)
// ============================================
const sendWelcomeEmailFunc = async (email, name) => {
  const loginLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`;
  
  const welcomeHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <div style="background: #f0f9ff; padding: 48px 32px 32px; text-align: center;">
        <div style="width: 80px; height: 80px; margin: 0 auto 24px;">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Catherine's Oasis" style="width: 100%; height: auto; display: block; border-radius: 16px;">` : `<div style="width:80px;height:80px;background:#0284c7;border-radius:16px;"></div>`}
        </div>
        <h1 style="margin: 0; color: #0c4a6e; font-size: 28px; font-weight: 600;">Catherine's Oasis</h1>
      </div>
      <div style="padding: 40px 32px; background: #ffffff;">
        <h2 style="margin: 0 0 12px; color: #0c4a6e; font-size: 20px;">Welcome to Catherine's Oasis, ${name}! 🎉</h2>
        <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
          Your email has been successfully verified. You can now log in and start booking your stay!
        </p>
        <div style="text-align: center; margin: 0 0 32px;">
          <a href="${loginLink}" style="background: #0284c7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 16px; display: inline-block;">
            Log In Now
          </a>
        </div>
        <div style="height: 1px; background: #e2e8f0; margin: 0 0 24px;"></div>
        <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
          Catherine's Oasis · 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    email: email,
    subject: "✨ Welcome to Catherine's Oasis! ✨",
    html: welcomeHtml
  });
};

// ============================================
// REGISTER - with email verification
// ============================================
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        existingUser.emailVerificationToken = verificationToken;
        existingUser.emailVerificationExpires = verificationExpires;
        await existingUser.save();
        
        await sendVerificationEmailFunc(email, existingUser.name, verificationToken);
        
        return res.status(400).json({ 
          message: "Email not verified. A new verification link has been sent.",
          needsVerification: true
        });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      phone,
      address,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await newUser.save();
    console.log(`✅ User created: ${email} (awaiting verification)`);

    await sendVerificationEmailFunc(email, name, verificationToken);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      needsVerification: true
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// VERIFY EMAIL
// ============================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired verification link. Please register again." 
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    console.log(`✅ Email verified for: ${user.email}`);

    await sendWelcomeEmailFunc(user.email, user.name);

    res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      redirectUrl: "/login?verified=true"
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    await sendVerificationEmailFunc(email, user.name, verificationToken);

    res.status(200).json({
      message: "Verification email resent. Please check your inbox."
    });

  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// LOGIN - with email verification check
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if email is verified (skip for Google OAuth users)
    if (!user.googleId && !user.isEmailVerified) {
      return res.status(401).json({ 
        message: "Please verify your email first. Check your inbox.",
        needsVerification: true,
        email: user.email
      });
    }

    // Check cooldown
    if (user.lastFailedAttempt) {
      const now = Date.now();
      const lastAttempt = new Date(user.lastFailedAttempt).getTime();
      const secondsSinceLastAttempt = Math.floor((now - lastAttempt) / 1000);

      let cooldownSeconds = 0;
      if (user.failedAttempts >= 5) cooldownSeconds = 120;
      else if (user.failedAttempts >= 4) cooldownSeconds = 60;
      else if (user.failedAttempts >= 3) cooldownSeconds = 30;

      if (cooldownSeconds > 0 && secondsSinceLastAttempt < cooldownSeconds) {
        const waitTimeRemaining = cooldownSeconds - secondsSinceLastAttempt;
        return res.status(429).json({
          message: `Too many failed attempts. Please wait ${waitTimeRemaining} seconds.`,
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedAttempts += 1;
      user.lastFailedAttempt = Date.now();
      await user.save();

      if (user.failedAttempts < 3) {
        const attemptsLeft = 3 - user.failedAttempts;
        return res.status(400).json({
          message: `Invalid email or password. ${attemptsLeft} attempts remaining.`,
          attemptsLeft,
        });
      } else {
        return res.status(400).json({
          message: "Invalid email or password. Too many attempts will trigger cooldown.",
          failedAttempts: user.failedAttempts,
        });
      }
    }

    user.failedAttempts = 0;
    user.lastFailedAttempt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        googleAvatar: user.googleAvatar
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// REGISTER STAFF - admin only
// ============================================
const registerStaff = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, email, password, role } = req.body;

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    if (role && role === "admin") {
      return res.status(403).json({ message: "Cannot create admin account" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "staff",
      isEmailVerified: true, // Staff accounts are auto-verified
    });

    await newStaff.save();

    res.status(201).json({
      message: "Staff created successfully",
      user: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// FORGOT PASSWORD - (keep your existing implementation)
// ============================================
const forgotPassword = async (req, res) => {
  // Your existing forgotPassword code here
};

// ============================================
// RESET PASSWORD - (keep your existing implementation)
// ============================================
const resetPassword = async (req, res) => {
  // Your existing resetPassword code here
};

// ============================================
// GOOGLE LOGIN - (keep your existing implementation)
// ============================================
const googleLogin = async (req, res) => {
  // Your existing googleLogin code here
  // Make sure to set isEmailVerified: true for Google users
};

// ============================================
// GET ALL CUSTOMERS, GET ALL STAFF, GET USER BY ID
// ============================================
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStaff = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    const staff = await User.find({ role: "staff" }).select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET PROFILE & UPDATE PROFILE
// ============================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  // Your existing updateProfile code here
};

// ============================================
// EXPORT
// ============================================
module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  registerStaff,
  getAllCustomers,
  getAllStaff,
  getUserById,
  forgotPassword,
  resetPassword,
  googleLogin,
  getProfile,
  updateProfile
};