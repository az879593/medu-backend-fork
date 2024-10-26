// src/__tests__/authenticationMiddleware.test.js
require('dotenv').config({ path: __dirname + '/../.env' });
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

jest.mock('jsonwebtoken'); // 模擬 jwt 以便控制其行為

describe('Authentication Middleware Test', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        jest.spyOn(console, 'error').mockImplementation(() => {}); // 禁用 console.error
    });

    afterAll(async () => {
        console.error.mockRestore(); // 恢復 console.error
        await mongoose.connection.close();
    });

    test('應回傳 401 當 token 不存在', async () => {
        const response = await request(app).get('/api/user/profile'); // 模擬沒有 token 的請求
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Token not provided');
    });

    test('應回傳 401 當 token 格式不正確', async () => {
        const response = await request(app)
            .get('/api/user/profile')
            .set('Authorization', 'InvalidTokenFormat'); // 模擬不正確格式的 token
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Token format is incorrect');
    });

    test('應回傳 401 當 token 無效或過期', async () => {
        jwt.verify.mockImplementation(() => {
            const error = new Error('Invalid token');
            error.name = 'TokenExpiredError';
            throw error;
        });

        const response = await request(app)
            .get('/api/user/profile')
            .set('Authorization', 'Bearer expiredtoken'); // 模擬過期的 token
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Token expired');
    });

    test('應回傳 500 當 SECRET_KEY 未設定', async () => {
        delete process.env.SECRET_KEY; // 模擬 SECRET_KEY 缺失

        const response = await request(app)
            .get('/api/user/profile')
            .set('Authorization', 'Bearer validtoken');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
        process.env.SECRET_KEY = 'your_secret_key'; // 恢復 SECRET_KEY
    });

    test('應回傳 401 當 token 缺少 userId', async () => {
        const mockDecoded = {}; // 模擬 payload 不包含 userId
        jwt.verify.mockReturnValue(mockDecoded);

        const response = await request(app)
            .get('/api/user/profile')
            .set('Authorization', 'Bearer tokenWithoutUserId');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid token payload');
    });

    test('應成功驗證並回傳 profile 當 token 有效', async () => {
        const mockDecoded = { userId: '12345' };
        jwt.verify.mockReturnValue(mockDecoded); // 模擬有效 token 驗證

        const response = await request(app)
            .get('/api/user/profile')
            .set('Authorization', 'Bearer validtoken');

        expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.SECRET_KEY);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Is protected token');
        expect(response.body).toHaveProperty('userId', mockDecoded.userId);
    });
});
