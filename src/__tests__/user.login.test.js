require('dotenv').config({ path: __dirname + '/../.env' });

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // clear users set
    await User.collection.drop();
    
    await new User({
        username: 'testuser',
        password: 'testpassword',
    }).save();
});

afterAll(async () => {
    await User.collection.drop();
    await mongoose.connection.close();
});

describe('User Login Test', () => {
    // login success
    test('Success user login', async () => {
        const response = await request(app).post('/api/user/login').send({
            username: 'testuser',
            password: 'testpassword',
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    // error password
    test('Error password', async () => {
        const response = await request(app).post('/api/user/login').send({
            username: 'testuser',
            password: 'wrongpassword',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User or password is not correct');
    });

    // user not found
    test('User not found', async () => {
        const response = await request(app).post('/api/user/login').send({
            username: 'wronguser',
            password: 'testpassword',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User or password is not correct');
    });
});
