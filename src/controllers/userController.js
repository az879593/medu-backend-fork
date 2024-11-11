const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// register
exports.register = async (req, res) => {
    try {
        const { username, password, nickname, birthDate, gender } = req.body;

        // 檢查必填欄位是否為空
        if (!username?.trim() || !password?.trim() || !nickname?.trim() || !birthDate || !gender?.trim()) {
            return res
                .status(400)
                .json({ message: '請提供完整的註冊資訊' });
        }

        // 檢查用戶是否已存在
        let user = await User.findOne({ 'profile.username': username });
        if (user) {
            return res.status(400).json({ message: 'User is existed' });
        }

        // 創建新用戶
        user = new User({
            profile: {
                username,
                nickname,
                birthDate,
                gender,
            },
            password,
        });
        await user.save();

        res.status(201).json({ message: 'register success' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            let message = '';
            for (const field in error.errors) {
                if (error.errors[field].path === 'profile.birthDate') {
                    message += '請提供有效的生日';
                } else if (error.errors[field].path === 'profile.gender') {
                    message += '請提供有效的性別';
                } else if (error.errors[field].path === 'profile.username') {
                    message += '請提供有效的用戶名';
                } else if (error.errors[field].path === 'profile.nickname') {
                    message += '請提供有效的暱稱';
                } else if (error.errors[field].path === 'password') {
                    message += '密碼長度應至少為6個字符';
                } else {
                    message += error.errors[field].message + ' ';
                }
            }
            return res.status(400).json({ message: message.trim() });
        }


        console.error(error); // 方便調試
        res.status(500).json({ message: 'server error' });
    }
};

// login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 檢查必填欄位是否為空
        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({ message: '請提供用戶名和密碼' });
        }

        // 檢查用戶是否存在
        const user = await User.findOne({ 'profile.username': username });
        if (!user) {
            return res.status(400).json({ message: '用戶不存在' });
        }

        // 驗證密碼
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '密碼錯誤' });
        }

        // 生成 JWT
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: '1h', // 1 hour expires
        });

        res.json({ token });
    } catch (error) {
        console.error(error); // 方便調試
        res.status(500).json({ message: '伺服器錯誤' });
    }
};
