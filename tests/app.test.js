const request = require('supertest');
const app = require('../app');

describe('Student Management API', () => {
    test('GET /api/health should return UP', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('UP');
    });

    test('GET /api/students should return an array', async () => {
        const res = await request(app).get('/api/students');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/students should validate required fields', async () => {
        const res = await request(app)
            .post('/api/students')
            .send({ name: 'Test Student' });

        expect(res.statusCode).toBe(400);
    });
});
