require('dotenv').config();
import { NextFunction, Request, Response } from 'express';
const bcrypt = require('bcrypt');;
const jwt = require('jsonwebtoken');
import { body, validationResult } from 'express-validator';
import User from '../models/userModels';

const saltRounds = 12;
const jwtSecret = process.env.JWT_SECRET_KEY;
// creating a new user
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.status(201).json({ user, token });
    } catch (err) {
        next(err);
    }
};
// login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.status(200).json({ user, token });
    } catch (err) {
        next(err);
    }
};

//get all users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        next(err);
    }
};
// get user by id
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};
//  update user by id
export const updateUserById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let data = req.body;
        // If authentication token matches with params id
        if(req.params.id != req.user._id){
            return res.status(401).json({ message: "User token not matched" });
        }
        if(req.body.password) {
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};
// delete user by id
export const deleteUserById = async (req: any, res: Response, next: NextFunction) => {
    try {
        // If authentication token matches with params id
        if(req.params.id != req.user._id){
            return res.status(401).json({ message: "User token not matched" });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};