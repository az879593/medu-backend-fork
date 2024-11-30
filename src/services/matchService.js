// services/matchService.js
const Match = require('../models/Match');
const userService = require('../services/userService');
const APIError = require('../errors/APIError');
const mongoose = require('mongoose');

exports.updateUserMatchStatus = async (fromUserId, toUserId, status) => {
    if (fromUserId === toUserId) {
        throw new APIError(400, '不能對自己進行操作');
    }

    const fromUserObjectId = mongoose.Types.ObjectId(fromUserId);
    const toUserObjectId = mongoose.Types.ObjectId(toUserId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const fromUser = await userService.getUserById(fromUserObjectId);
        const toUser = await userService.getUserById(toUserObjectId);

        if (!fromUser || !toUser) {
            throw new APIError(404, '用戶不存在');
        }

        let match = await Match.findOne({
            $or: [
                { $and: [{ userAId: fromUserObjectId }, { userBId: toUserObjectId }] },
                { $and: [{ userAId: toUserObjectId }, { userBId: fromUserObjectId }] },
            ],
        }).session(session);

        if (match) {
            if (match.userAId.equals(fromUserObjectId)) {
                match.userAStatus = status;
            } else if (match.userBId.equals(fromUserObjectId)) {
                match.userBStatus = status;
            }
        } else {
            match = new Match({
                userAId: fromUserObjectId,
                userBId: toUserObjectId,
                userAStatus: status,
                userBStatus: 'pending',
            });
        }

        await match.save({ session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}; 

exports.getFriendListByUserId = async (userId) => {
    try {
        // const user = await User.findById(userId).session(session);
        const friendList = await Match.find({
            $and: [
                { "matchStatus.userAtoBstatus": "like" },
                { "matchStatus.userBtoAstatus": "like" },
            ],
            $or: [
                { userAId: userId },
                { userBId: userId }
            ]
        }).lean();

        return friendList;
        
    } catch (error) {
        console.error("Error fetching matches:", error);
        throw new Error("Failed to fetch matches");
    }
};

exports.getMatchCardByUserId = async (userId) => {
    const userObjectId = mongoose.Types.ObjectId(userId);
    const checkUserSet = new Set();

    try {
        let randomUser = null;

        while (!randomUser) {
            const user = await userService.getRandomUserExcludeCollection(checkUserSet);

            if (!user) {
                return null;
            }

            checkUserSet.add(user._id.toString());

            const match = await Match.findOne({
                $or: [
                    { $and: [{userAId : userObjectId}, {userBId : user._id}] },
                    { $and: [{userAId : user._id}, {userBId : userObjectId}] }
                ]
            });

            if (
                !match ||
                (match.userAId.equals(userObjectId) && match.matchStatus.userAtoBstatus === "pending") ||
                (match.userBId.equals(userObjectId) && match.matchStatus.userBtoAstatus === "pending")
            ) {
                randomUser = user; // 找到符合條件的用戶
            }
        }

        return randomUser;
    } catch (error) {
        console.error("Error fetching match cards:", error);
        throw new Error("Failed to fetch match cards");
    } 
};

