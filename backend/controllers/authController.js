// backend/controllers/authController.js
// ============================================
// AUTH CONTROLLER - with password validation, cooldown, and forgot password
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
  // Check length 8-16
  if (password.length < 8 || password.length > 16) {
    return {
      valid: false,
      message: "Password must be 8 to 16 characters long",
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 uppercase letter (A-Z)",
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 lowercase letter (a-z)",
    };
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 number (0-9)",
    };
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 special character (!@#$%^&*)",
    };
  }

  return { valid: true };
};

// ============================================
// REGISTER - create new account with password validation
// ============================================
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        message: passwordCheck.message,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      phone,
      address,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// LOGIN - with cooldown timer
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check cooldown based on failed attempts
    if (user.lastFailedAttempt) {
      const now = Date.now();
      const lastAttempt = new Date(user.lastFailedAttempt).getTime();
      const secondsSinceLastAttempt = Math.floor((now - lastAttempt) / 1000);

      // Progressive cooldown
      let cooldownSeconds = 0;
      if (user.failedAttempts >= 5) {
        cooldownSeconds = 120; // 2 minutes after 5+ attempts
      } else if (user.failedAttempts >= 4) {
        cooldownSeconds = 60; // 1 minute after 4 attempts
      } else if (user.failedAttempts >= 3) {
        cooldownSeconds = 30; // 30 seconds after 3 attempts
      }

      // If still in cooldown
      if (cooldownSeconds > 0 && secondsSinceLastAttempt < cooldownSeconds) {
        const waitTimeRemaining = cooldownSeconds - secondsSinceLastAttempt;
        return res.status(429).json({
          message: `Too many failed attempts. Please wait ${waitTimeRemaining} seconds.`,
        });
      }
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment failed attempts
      user.failedAttempts += 1;
      user.lastFailedAttempt = Date.now();
      await user.save();

      // Return appropriate message
      if (user.failedAttempts < 3) {
        const attemptsLeft = 3 - user.failedAttempts;
        return res.status(400).json({
          message: `Invalid email or password. ${attemptsLeft} attempts remaining before cooldown.`,
          attemptsLeft,
        });
      } else {
        return res.status(400).json({
          message:
            "Invalid email or password. Too many attempts will trigger a longer cooldown.",
          failedAttempts: user.failedAttempts,
        });
      }
    }

    // Successful login - reset failed attempts
    user.failedAttempts = 0;
    user.lastFailedAttempt = null;
    await user.save();

    // Create JWT token
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

    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        message: passwordCheck.message,
      });
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
// FORGOT PASSWORD - REAL email sending
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account with that email exists" });
    }

    // Generate reset token
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save to user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    // Email HTML with Catherine's Oasis branding
    const message = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    
    <!-- Header with EMBEDDED LOGO (base64 - always visible) -->
    <div style="background: #f0f9ff; padding: 48px 32px 32px; text-align: center;">
      <div style="width: 80px; height: 80px; margin: 0 auto 24px;">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Catherine's Oasis" style="width: 100%; height: auto; display: block; border-radius: 16px;">` : `<div style="width:80px;height:80px;background:#0284c7;border-radius:16px;"></div>`}
      </div>
      <h1 style="margin: 0; color: #0c4a6e; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Catherine's Oasis</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 32px; background: #ffffff;">
      <h2 style="margin: 0 0 12px; color: #0c4a6e; font-size: 20px; font-weight: 500;">Reset your password</h2>
      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
        Hello <strong style="color: #0c4a6e;">${user.name}</strong>,
      </p>
      <p style="margin: 0 0 32px; color: #475569; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password. Click the button below to create a new one.
      </p>
      
      <!-- Button -->
      <div style="text-align: center; margin: 0 0 32px;">
        <a href="${resetURL}" 
           style="background: #0284c7; color: white; padding: 14px 32px; 
                  text-decoration: none; border-radius: 40px; font-weight: 500; 
                  font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(2, 132, 199, 0.2);">
          Reset Password
        </a>
      </div>
      
      <p style="margin: 0 0 32px; color: #64748b; font-size: 14px; text-align: center;">
        This link will expire in <strong>1 hour</strong>.
      </p>
      
      <div style="height: 1px; background: #e2e8f0; margin: 0 0 24px;"></div>
      
      <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.5;">
        If you didn't request this, please ignore this email.<br>
        Catherine's Oasis · 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
      </p>
    </div>
  </div>
`;

    // Send REAL email
    const sendEmail = require("../utils/sendEmail");
    const result = await sendEmail({
      email: user.email,
      subject: "🔐 Password Reset Request - Catherine's Oasis",
      html: message,
    });

    if (result.success) {
      console.log(`✅ Password reset email sent to ${user.email}`);
      return res.json({ message: "Password reset link sent to your email" });
    } else {
      console.error("Email sending failed:", result.error);
      return res
        .status(500)
        .json({ message: "Failed to send email. Please try again." });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ============================================
// RESET PASSWORD - DEBUG VERSION
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("🔍 DEBUG - Received token:", token);
    console.log("🔍 DEBUG - Token length:", token.length);

    // Hash the token from URL to match database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    console.log("🔍 DEBUG - Hashed token:", hashedToken);

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ DEBUG - No user found with this token");

      // Check kung may user na may ganitong token kahit expired
      const expiredUser = await User.findOne({
        resetPasswordToken: hashedToken,
      });
      if (expiredUser) {
        console.log("❌ DEBUG - Token found but EXPIRED");
        console.log("Expired at:", expiredUser.resetPasswordExpires);
        console.log("Current time:", Date.now());
      } else {
        console.log("❌ DEBUG - No user with this token at all");
      }

      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    console.log("✅ DEBUG - User found:", user.email);

    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user - WITH DEBUG LOGS
    console.log("🔍 BEFORE UPDATE - User in DB:", user.email);
    console.log("🔍 Old password hash:", user.password);
    console.log("🔍 New password (raw):", password);
    console.log("🔍 New password hash:", hashedPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.failedAttempts = 0;
    user.lastFailedAttempt = null;

    const savedUser = await user.save();
    console.log(
      "✅ AFTER UPDATE - Save result:",
      savedUser ? "Success" : "Failed",
    );
    console.log("🔍 New password hash in DB:", savedUser.password);

    console.log("✅ DEBUG - Password updated successfully for:", user.email);
    res.json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("❌ DEBUG - Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// ============================================
// GET ALL CUSTOMERS - for admin/staff
// ============================================
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET ALL STAFF - for admin only
// ============================================
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

// ============================================
// GET USER BY ID - for profiles
// ============================================
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

module.exports = {
  register,
  login,
  registerStaff,
  getAllCustomers,
  getAllStaff,
  getUserById,
  forgotPassword,
  resetPassword,
};