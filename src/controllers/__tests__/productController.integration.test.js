const request = require('supertest');
const app = require('../../server');
const StrategyRegistry = require('../../src/strategies/StrategyRegistry');

describe('On-Demand Endpoints', () => {
  describe('POST /api/products/:id/suggest-pricing', () => {
    it('should use CommerceAdvisor and return pricing recommendation', async () => {
      // Arrange
      const productId = '1'; // Valid mock product ID

      // Act
      const response = await request(app)
        .post(`/api/products/${productId}/suggest-pricing`)
        .send({ triggerReason: 'test_integration' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendation).toHaveProperty('currentPrice');
      expect(response.body.data.recommendation).toHaveProperty('recommendedPrice');
      expect(response.body.data.recommendation).toHaveProperty('direction');
      expect(response.body.data.recommendation).toHaveProperty('confidence');
      expect(response.body.data.recommendation).toHaveProperty('reasoning');
    });

    it('should handle invalid product ID', async () => {
      // Arrange
      const productId = 'invalid-id';

      // Act
      const response = await request(app)
        .post(`/api/products/${productId}/suggest-pricing`)
        .send({ triggerReason: 'test_integration' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products/:id/suggest-reorder', () => {
    it('should use CommerceAdvisor and return reorder recommendation', async () => {
      // Arrange
      const productId = '1'; // Valid mock product ID

      // Act
      const response = await request(app)
        .post(`/api/products/${productId}/suggest-reorder`)
        .send({ triggerReason: 'test_integration' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendation).toHaveProperty('currentStock');
      expect(response.body.data.recommendation).toHaveProperty('recommendedQuantity');
      expect(response.body.data.recommendation).toHaveProperty('suggestedLeadTimeDays');
      expect(response.body.data.recommendation).toHaveProperty('confidence');
      expect(response.body.data.recommendation).toHaveProperty('reasoning');
    });
  });

  describe('Strategy Configuration Endpoints', () => {
    describe('GET /api/config/strategy', () => {
      it('should return current strategy configuration', async () => {
        // Arrange
        StrategyRegistry.setActiveStrategy('rule');

        // Act
        const response = await request(app)
          .get('/api/config/strategy');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.active).toBe('rule');
        expect(response.body.data.available).toContain('rule');
        expect(response.body.data.available).toContain('competitor');
      });
    });

    describe('PATCH /api/config/strategy', () => {
      it('should update active strategy', async () => {
        // Act
        const response = await request(app)
          .patch('/api/config/strategy')
          .send({ strategy: 'rule' });

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.active).toBe('rule');
      });

      it('should reject invalid strategy', async () => {
        // Act
        const response = await request(app)
          .patch('/api/config/strategy')
          .send({ strategy: 'nonexistent' });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject missing strategy', async () => {
        // Act
        const response = await request(app)
          .patch('/api/config/strategy')
          .send({});

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });
});