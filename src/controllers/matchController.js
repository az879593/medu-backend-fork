// controllers/matchController.js
const matchService = require('../services/matchService');
const User = require('../models/User');

exports.likeUser = async (req, res) => {
    try {
        await matchService.likeUser(req.user.userId, req.params.targetUserId);
        res.json({ message: '已喜歡該用戶' });
    } catch (error) {
        if(error instanceof APIError){
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: '伺服器錯誤' });
        }
    }
};

exports.dislikeUser = async (req, res) => {
    try {
        await matchService.dislikeUser(req.user.userId, req.params.targetUserId);
        res.json({ message: '已不喜歡該用戶' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('profile.interactions.matches', 'profile.nickname');
        res.json(user.profile.interactions.matches);
    } catch (error) {
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

exports.getPendingLikes = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const userIdStr = req.user.userId.toString();

        const pending = await User.find({
            _id: { $in: user.profile.interactions.likedUsers },
            'profile.interactions.matches': { $nin: [userIdStr] },
        }).select('profile.nickname');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: '伺服器錯誤' });
    }
};