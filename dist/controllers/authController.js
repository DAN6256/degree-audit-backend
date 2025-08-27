"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const firebaseService_1 = require("../services/firebaseService");
/**
 * Handle user signup.  Accepts an email, password and optional name and
 * creates a new user record in database.  Passwords are hashed using
 */
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        try {
            // Check if user exists
            const existing = yield (0, firebaseService_1.getUserByEmail)(email);
            if (existing) {
                res.status(409).json({ message: 'User already exists' });
                return;
            }
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
            const passwordHash = yield bcryptjs_1.default.hash(password, saltRounds);
            yield (0, firebaseService_1.createUserRecord)(email, passwordHash, name);
            res.status(201).json({ message: 'User created successfully' });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || 'Error creating user' });
        }
    });
}
/**
 * Handle user login.  Verifies the provided credentials against the stored
 * hashed password and returns a JWT on success.
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        try {
            const user = yield (0, firebaseService_1.getUserByEmail)(email);
            if (!user) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            const match = yield bcryptjs_1.default.compare(password, user.passwordHash);
            if (!match) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(500).json({ message: 'Server configuration error' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ sub: user.email, name: user.name }, secret, { expiresIn: '8h' });
            res.json({ token });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || 'Error logging in' });
        }
    });
}
