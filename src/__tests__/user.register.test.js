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
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log("Database connection closed");
});

describe('User Register Test', () => {
    // register success
    test('Success user register', async () => {
        const response = await request(app).post('/api/user/register').send({
            username: 'Lean0411',
            password: '910411',
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('register success');

    });

    // register exiested
    test('User existed', async () => {
        // create a user first
        await new User({ username: 'Lean0411', password: '910411' }).save();

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
