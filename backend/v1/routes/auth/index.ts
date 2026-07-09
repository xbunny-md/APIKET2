import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Session } from '../../../models/index.js';
import { connectToDatabase } from '../../../core/db.js';
import { incrementStat } from '../../../core/stats.js';

const router = Router();

router.post('/register', async (req: any, res: any, next: any) => {
  try {
    await connectToDatabase();
    const { firstName, lastName, phone, email, password, confirmPassword, deviceID } = req.body;

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword || !deviceID) {
      return res.error(400, 'All fields are required');
    }

    if (password !== confirmPassword) {
      return res.error(400, 'Passwords do not match');
    }

    // One device = one account check
    const existingDevice = await User.findOne({ deviceID });
    if (existingDevice) {
      return res.error(403, 'Registration blocked: Device ID already registered to an account.');
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.error(400, 'Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
      deviceID
    });

    await newUser.save();
    
    // Update stats
    await incrementStat('totalUsers');

    res.success({}, 'User registered successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: any, res: any, next: any) => {
  try {
    await connectToDatabase();
    const { email, password, deviceHash, userAgent } = req.body;
    // For Vercel, req.ip or x-forwarded-for works
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    // Fallback if client doesn't send deviceHash for some reason
    const finalDeviceHash = deviceHash || req.cookies?.deviceHash || 'unknown_device';

    if (!email || !password) {
      return res.error(400, 'Email and password required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.error(401, 'Invalid credentials');
    }

    if (user.status === 'disabled') {
      return res.error(403, 'Account disabled');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.error(401, 'Invalid credentials');
    }
    
    // Internal device verification without interrupting user
    if (finalDeviceHash && user.deviceID !== finalDeviceHash && !user.deviceID.includes(finalDeviceHash)) {
      if (user.status !== 'requires_verification') {
        user.status = 'requires_verification';
      }
    }

    user.lastLogin = new Date();
    await user.save();
    
    await incrementStat('activeUsers');

    // Create session
    const session = await Session.create({
      userId: user._id,
      deviceHash: finalDeviceHash,
      ipAddress,
      userAgent: userAgent || req.headers['user-agent']
    });

    // Generate token pointing to session
    const token = jwt.sign(
      { userId: user._id, role: user.role, sessionId: session._id, deviceID: user.deviceID },
      process.env.JWT_SECRET || 'fallback_secret'
    );
    
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
      sameSite: 'strict'
    });

    // Also persist device hash in cookie if not there
    res.cookie('deviceHash', finalDeviceHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000
    });

    res.success({ role: user.role }, 'Login successful');
  } catch (error) {
    next(error);
  }
});

export default router;
