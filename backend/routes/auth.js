const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const authMiddleware = require('../middleware/auth');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register
router.post('/register', upload.array('photos', 5), async (req, res) => {
    const { role, ...data } = req.body;

    try {
        let user;
        let Model;

        switch (role) {
            case 'admin':
                Model = Admin;
                user = new Admin({ ...data, role: 'admin' });
                break;
            case 'gym':
                Model = Gym;
                user = new Gym({ ...data, role: 'gym' });
                if (req.files && req.files.length > 0) {
                    const uploadPromises = req.files.map((file) =>
                        new Promise((resolve, reject) => {
                            cloudinary.uploader.upload_stream(
                                { folder: 'gym_photos' },
                                (error, result) => {
                                    if (error) reject(error);
                                    resolve(result.secure_url);
                                }
                            ).end(file.buffer);
                        })
                    );
                    const uploadedPhotos = await Promise.all(uploadPromises);
                    user.photos = uploadedPhotos;
                }
                break;
            case 'trainer':
                Model = Trainer;
                user = new Trainer({ ...data, role: 'trainer' });
                break;
            case 'member':
                Model = Member;
                user = new Member({ ...data, role: 'member' });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await Model.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        next(error); // Pass to error middleware
    }
});

// Login
router.post('/login', async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    try {
        let user;
        let Model;

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        switch (role) {
            case 'admin':
                Model = Admin;
                break;
            case 'gym':
                Model = Gym;
                break;
            case 'trainer':
                Model = Trainer;
                break;
            case 'member':
                Model = Member;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        user = await Model.findOne({ email: { $regex: new RegExp('^' + trimmedEmail + '$', 'i') } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(trimmedPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        next(error);
    }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
    const { email, role, newPassword } = req.body;

    if (!email || !role || !newPassword) {
        return res.status(400).json({ message: 'Email, role, and new password are required' });
    }

    try {
        let Model;

        switch (role) {
            case 'admin':
                Model = Admin;
                break;
            case 'gym':
                Model = Gym;
                break;
            case 'trainer':
                Model = Trainer;
                break;
            case 'member':
                Model = Member;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await Model.findOne({ email: { $regex: new RegExp('^' + email.trim() + '$', 'i') } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword; // The pre('save') hook will hash it
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
});

// Get Profile
router.get('/profile', authMiddleware, async (req, res, next) => {
    try {
        let user;
        switch (req.user.role) {
            case 'admin':
                user = await Admin.findById(req.user.id).select('-password');
                break;
            case 'gym':
                user = await Gym.findById(req.user.id).select('-password');
                break;
            case 'trainer':
                user = await Trainer.findById(req.user.id).select('-password');
                break;
            case 'member':
                user = await Member.findById(req.user.id).select('-password');
                break;
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Update Profile (Now with Image Upload)
router.put('/profile', authMiddleware, upload.single('profileImage'), async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        let user;
        let Model;

        switch (req.user.role) {
            case 'admin':
                Model = Admin;
                break;
            case 'gym':
                Model = Gym;
                break;
            case 'trainer':
                Model = Trainer;
                break;
            case 'member':
                Model = Member;
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        user = await Model.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Handle profile image upload
        if (req.file) {
            // Delete the existing image if it exists
            if (user.profileImage) {
                const publicId = user.profileImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`profile_images/${publicId}`);
            }

            // Upload the new image
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'profile_images' },
                    (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    }
                ).end(req.file.buffer);
            });

            user.profileImage = uploadResult.secure_url;
        }

        await user.save();

        res.json({ message: 'Profile updated', user: { id: user._id, email: user.email, role: user.role, profileImage: user.profileImage } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;