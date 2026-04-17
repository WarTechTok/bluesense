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

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password,
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
// STAFF LOGIN - staff authentication with status check
// ============================================
// Authenticates staff members created in the Staff Management system
// Checks if status is "Active" before allowing login
// Disabled accounts cannot login
const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Require the Staff model for this endpoint
    const Staff = require('../models/Staff');

    // Find staff member by email
    const staff = await Staff.findOne({ email: email.toLowerCase() });
    if (!staff) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if account is disabled
    if (staff.status === 'Disabled') {
      return res.status(403).json({ 
        message: "Account is disabled. Please contact your administrator.",
        accountDisabled: true
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, email: staff.email, role: staff.role, staffId: staff.staffId },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      staff: {
        id: staff._id,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        position: staff.position,
        status: staff.status
      }
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

    const newStaff = new User({
      name,
      email,
      password,
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
// FORGOT PASSWORD
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "No account with that email" });
    }
    
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    
    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
    
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; background: #0284c7; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      </div>
    `;
    
    await sendEmail({ email: user.email, subject: "Password Reset", html: message });
    
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }
    
    user.password = password;  // Pre-save middleware will hash it
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
    
    console.log('🔍 Google user data:', { id, email, name, picture });
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // New user: create with Google data
      const tempPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      user = new User({
        name,
        email,
        googleId: id,
        googleAvatar: picture,
        role: 'customer',
        isEmailVerified: true,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ New Google user created: ${email}`);
    } else {
      // Existing user: ONLY update Google-specific fields, preserve custom data
      // Don't overwrite name, phone, address if user already set them
      if (!user.googleId) {
        user.googleId = id;
      }
      // Only update Google avatar if user doesn't have a custom avatar
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
      { expiresIn: "7d" }
    );
    
    // IMPORTANT: Send the user data from DATABASE, not from Google
    // This preserves the user's custom name, phone, address
    const userData = {
      id: user._id,
      name: user.name,           // From database (could be custom)
      email: user.email,
      role: user.role,
      phone: user.phone,         // From database
      address: user.address,     // From database
      avatar: user.avatar || user.googleAvatar
    };
    
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendURL}/oauth-redirect?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    
    console.log('✅ Google login successful, redirecting');
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
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE PROFILE - FIXED VERSION
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
    
    // Build update object
    const updateData = {};
    if (name !== undefined && name !== '') updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    
    // Handle avatar if uploaded
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      // Clear Google avatar if user uploads custom avatar
      updateData.googleAvatar = null;
      console.log("Avatar file:", req.file.filename);
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: false }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("User updated successfully:", updatedUser);
    
    res.json({
      message: "Profile updated successfully",
      user: updatedUser
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
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update to new password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// EXPORT
// ============================================
module.exports = {
  register,
  login,
  staffLogin,
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
  changePassword
};