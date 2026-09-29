const request = require('supertest');
const app = require('../../app');
const Product = require('../../models/Product');
const PricingSuggestion = require('../../models/PricingSuggestion');
const ReorderSuggestion = require('../../models/ReorderSuggestion');
const connectDB = require('../../config/db');
const seedData = require('../../scripts/seed');

let server;
let testProduct;

beforeAll(async () => {
  // Connect to database
  await connectDB();
  
  // Seed test data
  await seedData();
  
  // Get a test product
  testProduct = await Product.findOne({ sku: 'ELEC-002' }); // This one is near reorder threshold
});

afterAll(async () => {
  // Clean up test data
  await Product.deleteMany({});
  await PricingSuggestion.deleteMany({});
  await ReorderSuggestion.deleteMany({});
});

describe('Strategy Configuration API', () => {
  describe('GET /api/v1/config/strategy', () => {
    it('should return current strategy configuration', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/config/strategy');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('available');
      expect(response.body.data.available).toContain('rule');
    });
  });

  describe('PATCH /api/v1/config/strategy', () => {
    it('should update active strategy', async () => {
      // Act
      const response = await request(app)
        .patch('/api/v1/config/strategy')
        .send({ strategy: 'rule' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.active).toBe('rule');
    });

    it('should reject invalid strategy', async () => {
      // Act
      const response = await request(app)
        .patch('/api/v1/config/strategy')
        .send({ strategy: 'nonexistent' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing strategy', async () => {
      // Act
      const response = await request(app)
        .patch('/api/v1/config/strategy')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('Pricing Suggestion API with Pluggable Engine', () => {
  it('should create pricing suggestion using active strategy', async () => {
    // Act
    const response = await request(app)
      .post(`/api/v1/products/${testProduct._id}/suggest-pricing`)
      .send({ triggerReason: 'MANUAL' });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('product');
    expect(response.body.data).toHaveProperty('currentPrice');
    expect(response.body.data).toHaveProperty('recommendedPrice');
    expect(response.body.data).toHaveProperty('direction');
    expect(response.body.data).toHaveProperty('confidence');
    expect(response.body.data).toHaveProperty('reasoning');
    expect(response.body.data).toHaveProperty('triggerReason');
  });
});

describe('Reorder Suggestion API with Pluggable Engine', () => {
  it('should create reorder suggestion using active strategy', async () => {
    // Act
    const response = await request(app)
      .post(`/api/v1/products/${testProduct._id}/suggest-reorder`)
      .send({ triggerReason: 'MANUAL' });

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data).toHaveProperty('product');
    expect(response.body.data).toHaveProperty('currentStock');
    expect(response.body.data).toHaveProperty('recommendedQuantity');
    expect(response.body.data).toHaveProperty('suggestedLeadTimeDays');
    expect(response.body.data).toHaveProperty('confidence');
    expect(response.body.data).toHaveProperty('reasoning');
    expect(response.body.data).toHaveProperty('triggerReason');
  });
});