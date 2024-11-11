require('dotenv').config({ path: __dirname + '/../.env' });

const request = require('supertest');
const app = require('../app'); // 確保正確引入你的 Express 應用
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
    // 連接到 MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
    console.log(`SECRET_KEY: ${process.env.SECRET_KEY}`);
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

describe('User Registration', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: 'password123',
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('register success');

        const user = await User.findOne({ 'username': 'testuser' });
        expect(user).not.toBeNull();
        expect(user.profile.nickname).toBe('Test Nickname');
    });

    it('should not register a user with an existing username', async () => {
        // 創建用戶
        await new User({
            profile: {
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            },
            username: 'testuser',
            password: 'password123',
        }).save();

        // 嘗試用相同的用戶名註冊
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: 'password456',
                nickname: 'Another Nickname',
                birthDate: '1992-02-02',
                gender: 'female',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User is existed');
    });

    it('should require username, password, nickname, birthDate, and gender', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: '',
                password: '',
                nickname: '',
                birthDate: '',
                gender: '',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('請提供完整的註冊資訊');
    });

    it('should not register a user with invalid birthDate', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: 'password123',
                nickname: 'Test Nickname',
                birthDate: 'invalid-date',
                gender: 'male',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('請提供有效的生日');
    });

    it('should not register a user with invalid gender', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: 'password123',
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'invalid-gender',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('請提供有效的性別');
    });

    it('should hash the password before saving', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: 'password123',
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            });

        expect(res.statusCode).toBe(201);

        const user = await User.findOne({ 'username': 'testuser' });
        expect(user).not.toBeNull();
        const isMatch = await bcrypt.compare('password123', user.password);
        expect(isMatch).toBe(true);
    });

    // 測試無效用戶名長度
    it('should not register a user with a short username', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'ab',
                password: 'password123',
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('請提供有效的用戶名');
    });

    // 測試無效密碼長度
    it('should not register a user with a short password', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: '123', // 密碼太短
                nickname: 'Test Nickname',
                birthDate: '1990-01-01',
                gender: 'male',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('密碼長度應至少為6個字符');
    });

    // 測試無效暱稱長度
    it('should not register a user with a short nickname', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                username: 'testuser',
                password: 'password123',
                nickname: 'ab', // 暱稱太短
                birthDate: '1990-01-01',
                gender: 'male',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('請提供有效的暱稱');
    });
});
