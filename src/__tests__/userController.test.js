const request = require('supertest');
const express = require('express');
const userController = require('../controllers/userController');
const userService = require('../services/userService');

// 建立一個測試用的 Express 應用程序
const app = express();
app.use(express.json());
app.post('/register', userController.register);
app.post('/login', userController.login);

// Mock userService
jest.mock('../services/userService');

describe('User Controller', () => {
    describe('register', () => {
        it('should return 201 and success message when registration is successful', async () => {
            userService.register.mockResolvedValueOnce(); // 模擬成功的註冊

            const response = await request(app)
                .post('/register')
                .send({
                    username: 'testuser1',
                    password: 'password123',
                    nickname: 'Tester',
                    birthDate: '1990-01-01',
                    gender: 'male'
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('register success');
        });
        
        it('should return custom error when APIError is thrown', async () => {
            userService.register.mockRejectedValueOnce({
                name: 'APIError',
                statusCode: 400,
                message: 'Invalid data'
            });

            const response = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid data');
        });

        it('should return 500 when an unexpected error occurs', async () => {
            userService.register.mockRejectedValueOnce(new Error("server error"));

            const response = await request(app)
                .post('/register')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    nickname: 'Tester',
                    birthDate: '1990-01-01',
                    gender: 'male'
                });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('server error');
        });
        
    });
});
