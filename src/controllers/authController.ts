import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUserRecord } from '../services/firebaseService';

/**
 * Handle user signup.  Accepts an email, password and optional name and
 * creates a new user record in database.  Passwords are hashed using
 */
export async function signup(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  try {
    // Check if user exists
    const existing = await getUserByEmail(email);
    if (existing) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await createUserRecord(email, passwordHash, name);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error creating user' });
  }
}

/**
 * Handle user login.  Verifies the provided credentials against the stored
 * hashed password and returns a JWT on success.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }
    const token = jwt.sign({ sub: user.email, name: user.name }, secret, { expiresIn: '8h' });
    res.json({ token });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error logging in' });
  }
}