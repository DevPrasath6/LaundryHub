"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
// Get all users (admin only)
router.get('/', auth_1.auth, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            filter.role = role;
        }
        const users = await User_1.User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(filter);
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user by ID
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.logger.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Update user
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, address, preferences } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.params.id, {
            firstName,
            lastName,
            phoneNumber,
            address,
            preferences
        }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        logger_1.logger.info(`User updated: ${user.email}`);
        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    }
    catch (error) {
        logger_1.logger.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Delete user (admin only)
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['admin']), async (req, res) => {
    try {
        const user = await User_1.User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        logger_1.logger.info(`User deleted: ${user.email}`);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map