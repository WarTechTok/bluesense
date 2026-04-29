// backend/controllers/authController.js
// ============================================
// AUTH CONTROLLER - with email verification DISABLED
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
    return {
      valid: false,
      message: "Password must be 8 to 16 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 uppercase letter (A-Z)",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 lowercase letter (a-z)",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 number (0-9)",
    };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least 1 special character (!@#$%^&*)",
    };
  }
  return { valid: true };
};

// ============================================
// SEND VERIFICATION EMAIL - DISABLED
// ============================================
const sendVerificationEmailFunc = async (email, name, verificationToken) => {
  // EMAIL DISABLED - No email sent
  console.log(`📧 EMAIL DISABLED - Would send verification to: ${email}`);
  return { success: true, message: "Email disabled" };
};

// ============================================
// SEND WELCOME EMAIL - DISABLED
// ============================================
const sendWelcomeEmailFunc = async (email, name) => {
  // EMAIL DISABLED - No email sent
  console.log(`📧 EMAIL DISABLED - Would send welcome to: ${email}`);
  return { success: true, message: "Email disabled" };
};

// ============================================
// REGISTER - with email verification DISABLED
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
        // Email disabled - just let them know account exists
        return res.status(400).json({
          message: "Account already exists. Please login.",
        });
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || "customer",
      phone,
      address,
      isEmailVerified: true, // AUTO-VERIFIED - no email needed
    });

    await newUser.save();
    console.log(`✅ User created: ${email} (auto-verified - email disabled)`);

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful! You can now log in.",
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      needsVerification: false,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// VERIFY EMAIL - DISABLED (always success)
// ============================================
const verifyEmail = async (req, res) => {
  // Email verification disabled - just redirect to login
  res.status(200).json({
    message: "Email verification is disabled. You can log in directly.",
    redirectUrl: "/login?verified=true",
  });
};

// ============================================
// RESEND VERIFICATION EMAIL - DISABLED
// ============================================
const resendVerificationEmail = async (req, res) => {
  res.status(200).json({
    message: "Email verification is disabled. You can log in directly.",
  });
};

// ============================================
// LOGIN - with email verification check (disabled)
// ============================================
// UNIFIED LOGIN - handles both customers and staff
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Staff = require("../models/Staff");
    const emailLower = email.toLowerCase();

    console.log(
      "🔍 LOGIN ATTEMPT: Email =",
      email,
      "Password length =",
      password?.length,
    );

    // STEP 1: Try to find STAFF account FIRST
    console.log("🔍 Checking Staff model for email:", emailLower);
    const staff = await Staff.findOne({ email: emailLower });
    console.log(
      "🔍 Staff lookup result:",
      staff ? `Found staff: ${staff.name} (${staff.staffId})` : "NOT FOUND",
    );

    if (staff) {
      // ===== STAFF LOGIN =====
      console.log("✅ Staff account found. Status:", staff.status);

      if (staff.status === "Disabled") {
        return res.status(403).json({
          message: "Account is disabled. Please contact your administrator.",
          accountDisabled: true,
        });
      }

      const isMatch = await bcrypt.compare(password, staff.password);
      console.log(
        "🔐 Password comparison result:",
        isMatch ? "MATCH ✅" : "MISMATCH ❌",
      );
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          id: staff._id,
          email: staff.email,
          role: staff.role,
          staffId: staff.staffId,
        },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        { expiresIn: "7d" },
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: staff._id,
          staffId: staff.staffId,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          position: staff.position,
          status: staff.status,
        },
      });
    }

    // STEP 2: Try to find CUSTOMER account (User model)
    console.log(
      "🔍 Checking User model for customer account - Email:",
      emailLower,
    );
    let user = await User.findOne({ email: emailLower });
    console.log("🔍 User model result:", user ? "FOUND" : "NOT FOUND");

    if (user) {
      // ===== CUSTOMER LOGIN - Email verification check removed =====

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
            message:
              "Invalid email or password. Too many attempts will trigger cooldown.",
            failedAttempts: user.failedAttempts,
          });
        }
      }

      user.failedAttempts = 0;
      user.lastFailedAttempt = null;
      await user.save();

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        { expiresIn: "7d" },
      );

      return res.json({
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
          googleAvatar: user.googleAvatar,
        },
      });
    }

    // STEP 3: Account not found in either model
    console.log(
      "❌ Account not found in Staff or User models for email:",
      emailLower,
    );
    return res.status(400).json({ message: "Invalid email or password" });
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

    const { name, email, password, role, position } = req.body;

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    if (role && role === "admin") {
      return res.status(403).json({ message: "Cannot create admin account" });
    }

    const Staff = require("../models/Staff");

    const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
    if (existingStaff) {
      return res
        .status(400)
        .json({ message: "Staff account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const lastStaff = await Staff.findOne().sort({ createdAt: -1 });
    let staffId = "STF-0001";
    if (lastStaff && lastStaff.staffId) {
      const lastNum = parseInt(lastStaff.staffId.split("-")[1]) || 0;
      staffId = `STF-${String(lastNum + 1).padStart(4, "0")}`;
    }

    const newStaff = new Staff({
      staffId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "staff",
      position: position || "Housekeeper",
      status: "Active",
    });

    await newStaff.save();

    res.status(201).json({
      message: "Staff created successfully",
      user: {
        id: newStaff._id,
        staffId: newStaff.staffId,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        position: newStaff.position,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// FORGOT PASSWORD - DISABLED (no email)
// ============================================
const forgotPassword = async (req, res) => {
  res.json({ message: "Password reset is disabled. Please contact support." });
};

// ================================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GOOGLE LOGIN - PRESERVE USER DATA
// ============================================
const googleLogin = async (req, res) => {
  try {
    const { id, email, name, picture } = req.user;

    console.log("🔍 Google user data:", { id, email, name, picture });

    let user = await User.findOne({ email });

    if (!user) {
      const tempPassword = crypto.randomBytes(20).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      user = new User({
        name,
        email,
        googleId: id,
        googleAvatar: picture,
        role: "customer",
        isEmailVerified: true,
        password: hashedPassword,
      });
      await user.save();
      console.log(`✅ New Google user created: ${email}`);
    } else {
      if (!user.googleId) {
        user.googleId = id;
      }
      if (!user.avatar) {
        user.googleAvatar = picture;
      }
      user.isEmailVerified = true;
      await user.save();
      console.log(`✅ Existing user updated with Google: ${email}`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" },
    );

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar || user.googleAvatar,
    };

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendURL}/oauth-redirect?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;

    console.log("✅ Google login successful, redirecting");
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Google login error:", error);
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendURL}/login?error=google_auth_failed`);
  }
};

// ============================================
// GET ALL CUSTOMERS
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
// GET ALL STAFF
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
// GET USER BY ID
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

// ============================================
// GET PROFILE
// ============================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
const updateProfile = async (req, res) => {
  console.log("========== PROFILE UPDATE ==========");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    console.log("User ID:", userId);
    console.log("Update data:", { name, phone, address });

    const updateData = {};
    if (name !== undefined && name !== "") updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      updateData.googleAvatar = null;
      console.log("Avatar file:", req.file.filename);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: false,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User updated successfully:", updatedUser);

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message });
  }
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
  updateProfile,
  changePassword,
};