import request from 'supertest';
import app from '../app';
import { cacheService } from '../services/cacheService';

describe('User Routes', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
  });

  describe('GET /users/:id', () => {
    it('should return user data for valid ID', async () => {
      const response = await request(app)
        .get('/users/1')
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(response.body).toHaveProperty('cached');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid user ID', async () => {
      const response = await request(app)
        .get('/users/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should serve from cache on subsequent requests', async () => {
      // First request
      const response1 = await request(app)
        .get('/users/2')
        .expect(200);

      expect(response1.body.cached).toBe(false);

      // Second request should be cached
      const response2 = await request(app)
        .get('/users/2')
        .expect(200);

      expect(response2.body.cached).toBe(true);
      expect(response2.body.data).toEqual(response1.body.data);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.body.data).toMatchObject(newUser);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });
  });
});
