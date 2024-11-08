require('dotenv').config({ path: __dirname + '/../.env' });

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // 清理資料庫並關閉連接
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    // 清空 User 集合
    await User.deleteMany({});
});

afterEach(async () => {
    // 清空 User 集合
    await User.deleteMany({});
});

describe('User Login Test', () => {
    it('Success user login', async () => {
        // 創建用戶時提供所有必要欄位
        await new User({
            profile: {
                username: 'testuser',
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            },
            password: 'password123',
        }).save();

        const res = await request(app)
            .post('/api/user/login')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('Error password', async () => {
        // 創建用戶時提供所有必要欄位
        await new User({
            profile: {
                username: 'testuser',
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            },
            password: 'password123',
        }).save();

        const res = await request(app)
            .post('/api/user/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('密碼錯誤');
    });

    it('User not found', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                username: 'nonexistentuser',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('用戶不存在');
    });
});
