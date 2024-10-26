require('dotenv').config({ path: __dirname + '/../.env' });

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
    // connect mongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    // clear mongoDB
    await User.collection.drop();
    await mongoose.connection.close();
});

describe('User Register Test', () => {
    const username = 'Lean0411';
    const password = '910411';

    // Test case for successful user registration
    test('Success user register', async () => {
        // Step 1: Register a new user
        const registerResponse = await request(app).post('/api/user/register').send({
            username,
            password,
        });

        expect(registerResponse.status).toBe(201);

        // Step 2: Check if the user is actually in the database
        const user = await User.findOne({ username });
        expect(user).not.toBeNull();
        expect(user.username).toBe(username);
    });

    // register exiested
    test('User existed', async () => {

        const response = await request(app).post('/api/user/register').send({
            username: 'Lean0411',
            password: '910411',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User is existed');
    });

    // required username or password
    test('Required username or password register', async () => {
        const response = await request(app)
            .post('/api/user/register')
            // username or password is empty
            .send({
                username: '',
                password: '',
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('required username or password');
    });
});
