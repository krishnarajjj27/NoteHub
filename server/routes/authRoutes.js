const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/mailer');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Please try again later.' },
});

function buildToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function verificationExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = verificationExpiry();

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpires = verificationCodeExpires;
      await existingUser.save();

      await sendVerificationEmail(existingUser.email, existingUser.name, verificationCode);

      return res.status(200).json({
        message: 'Verification code sent. Please verify your email to continue.',
      });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(user.email, user.name, verificationCode);

    return res.status(201).json({
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    if (error.message?.includes('Invalid login') || error.message?.includes('Username and Password not accepted')) {
      return res.status(500).json({
        message: 'Email verification setup failed: invalid Gmail app password. Update EMAIL_PASS in server/.env.',
      });
    }

    if (error.message?.includes('EMAIL_USER and EMAIL_PASS must be set')) {
      return res.status(500).json({
        message: 'Email verification setup missing: set EMAIL_USER and EMAIL_PASS in server/.env.',
      });
    }

    return res.status(500).json({ message: 'Failed to register user', error: error.message });
  }
});

router.post('/verify-email', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      const token = buildToken(user._id);
      return res.status(200).json({
        message: 'Email already verified',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    }

    if (!user.verificationCode || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code expired. Please request a new code.' });
    }

    if (user.verificationCode !== String(code).trim()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = buildToken(user._id);

    return res.status(200).json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify email', error: error.message });
  }
});

router.post('/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    user.verificationCode = generateVerificationCode();
    user.verificationCodeExpires = verificationExpiry();
    await user.save();

    await sendVerificationEmail(user.email, user.name, user.verificationCode);

    return res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to resend verification code', error: error.message });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
      });
    }

    const token = buildToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
});

module.exports = router;
