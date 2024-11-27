// services/matchService.js
const User = require('../models/User');
const APIError = require('../errors/APIError');
const mongoose = require('mongoose');

exports.likeUser = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new APIError(400, '不能對自己進行喜歡操作');
    }

    const userIdObj = mongoose.Types.ObjectId(userId);
    const targetUserIdObj = mongoose.Types.ObjectId(targetUserId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        if (!user || !targetUser) {
            throw new APIError(404, '用戶不存在');
        }

        // 更新 likedUsers
        await User.updateOne(
            { _id: userIdObj },
            { $addToSet: { 'profile.interactions.likedUsers': targetUserIdObj } }
        ).session(session);

        // 檢查是否互相喜歡
        if (targetUser.profile.interactions.likedUsers.includes(userIdObj)) {
            // 互相喜歡，建立配對
            await User.updateOne(
                { _id: userIdObj },
                { $addToSet: { 'profile.interactions.matches': targetUserIdObj } }
            ).session(session);

            await User.updateOne(
                { _id: targetUserIdObj },
                { $addToSet: { 'profile.interactions.matches': userIdObj } }
            ).session(session);
        }

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

exports.dislikeUser = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new APIError(400, '不能對自己進行不喜歡操作');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new APIError(404, '用戶不存在');
    }

    const targetIdStr = targetUserId.toString();

    // 更新 dislikedUsers
    if (!user.profile.interactions.dislikedUsers.some(id => id.toString() === targetIdStr)) {
        user.profile.interactions.dislikedUsers.push(targetUserId);
    }

    await user.save();
};