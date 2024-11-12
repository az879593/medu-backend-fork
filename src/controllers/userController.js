const userService = require('../services/userService');

// register
exports.register = async (req, res) => {
    try {
        const { username, password, nickname, birthDate, gender } = req.body;
        const userData = { username, password, nickname, birthDate, gender };

        await userService.register(userData);

        res.status(201).json({ message: 'register success' });
    } catch (error) {
        if(error.name === 'APIError'){
            return res.status(error.statusCode).json({ message: error.message.trim() });
        }
        return res.status(500).json({ message: error.message.trim() });
    }
};

// login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const token = await userService.login(username, password);

        res.json({ token });
    } catch (error) {
        if(error.name === "APIError") {
            return res.status(error.statusCode).json({ message: error.message.trim() });
        }
        // console.error(error); // 方便調試
        res.status(500).json({ message: '伺服器錯誤' });
    }
};
