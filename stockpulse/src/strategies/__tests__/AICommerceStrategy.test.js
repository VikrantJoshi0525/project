const AICommerceStrategy = require('../../strategies/AICommerceStrategy');
const PromptBuilder = require('../../services/promptBuilder');
const ResponseParser = require('../../services/responseParser');
const RecommendationValidator = require('../../services/recommendationValidator');

describe('AICommerceStrategy', () => {
  describe('Prompt Builder', () => {
    const testContext = {
      product: {
        name: 'Test Product',
        category: 'ELECTRONICS',
        currentPrice: 100,
        stockLevel: 5,
        reorderThreshold: 10,
        demandVelocity: 15
      },
      categoryAverageDemandVelocity: 8,
      triggerReason: 'INVENTORY_LOW'
    };

    it('should build inventory-low prompt with product data', () => {
      const prompt = PromptBuilder.buildInventoryLowPrompt(testContext);
      
      expect(prompt).toContain('Test Product');
      expect(prompt).toContain('ELECTRONICS');
      expect(prompt).toContain('100');
      expect(prompt).toContain('inventory is below/near the reorder threshold');
      expect(prompt).toContain('merchandising decision that considers inventory protection and demand');
    });

    it('should build demand-spike prompt with product data', () => {
      const prompt = PromptBuilder.buildDemandSpikePrompt(testContext);
      
      expect(prompt).toContain('Test Product');
      expect(prompt).toContain('ELECTRONICS');
      expect(prompt).toContain('100');
      expect(prompt).toContain('demand velocity is significantly above the category average');
      expect(prompt).toContain('capitalize on increased demand while avoiding an excessive price change');
    });

    it('should build different prompts for different trigger reasons', () => {
      const inventoryLowPrompt = PromptBuilder.buildInventoryLowPrompt(testContext);
      const demandSpikePrompt = PromptBuilder.buildDemandSpikePrompt({
        ...testContext,
        triggerReason: 'DEMAND_SPIKE'
      });
      
      expect(inventoryLowPrompt).not.toEqual(demandSpikePrompt);
      expect(inventoryLowPrompt).toContain('inventory is below/near the reorder threshold');
      expect(demandSpikePrompt).toContain('demand velocity is significantly above the category average');
    });
  });

  describe('Response Parser', () => {
    it('should parse valid JSON response', () => {
      const validResponse = {
        pricing: {
          recommendedPrice: 110,
          direction: 'INCREASE',
          confidence: 0.9,
          reasoning: 'Low inventory detected'
        },
        reorder: {
          recommendedQuantity: 25,
          confidence: 0.85,
          reasoning: 'Calculated based on reorder threshold'
        }
      };
      
      const parsed = ResponseParser.parseResponse(JSON.stringify(validResponse));
      expect(parsed.pricing.recommendedPrice).toBe(110);
      expect(parsed.reorder.recommendedQuantity).toBe(25);
    });

    it('should handle response with markdown code fences', () => {
      const responseWithFences = '```json\n{\n  "pricing": {\n    "recommendedPrice": 110,\n    "direction": "INCREASE",\n    "confidence": 0.9,\n    "reasoning": "Low inventory detected"\n  },\n  "reorder": {\n    "recommendedQuantity": 25,\n    "confidence": 0.85,\n    "reasoning": "Calculated based on reorder threshold"\n  }\n}\n```';
      
      const parsed = ResponseParser.parseResponse(responseWithFences);
      expect(parsed.pricing.recommendedPrice).toBe(110);
      expect(parsed.reorder.recommendedQuantity).toBe(25);
    });

    it('should reject malformed JSON', () => {
      const malformedResponse = '{"pricing": {"recommendedPrice": 110, "direction": "INCREASE", "confidence": 0.9, "reasoning": "Low inventory detected"}, "reorder": {}}';
      
      expect(() => {
        ResponseParser.parseResponse(malformedResponse);
      }).toThrow('Missing required pricing or reorder objects');
    });
  });

  describe('Recommendation Validator', () => {
    it('should validate valid pricing recommendation', () => {
      const validPricing = {
        recommendedPrice: 110,
        direction: 'INCREASE',
        confidence: 0.9,
        reasoning: 'Low inventory detected'
      };
      
      const validated = RecommendationValidator.validatePricing(validPricing, 100);
      expect(validated.recommendedPrice).toBe(110);
      expect(validated.direction).toBe('INCREASE');
      expect(validated.confidence).toBe(0.9);
    });

    it('should reject invalid price (more than 10x current price)', () => {
      const invalidPricing = {
        recommendedPrice: 1500, // 15x current price of 100
        direction: 'INCREASE',
        confidence: 0.9,
        reasoning: 'Too aggressive pricing'
      };
      
      expect(() => {
        RecommendationValidator.validatePricing(invalidPricing, 100);
      }).toThrow('Pricing: recommendedPrice is unsafe (more than 10x current price)');
    });

    it('should validate valid reorder recommendation', () => {
      const validReorder = {
        recommendedQuantity: 25,
        confidence: 0.85,
        reasoning: 'Calculated based on reorder threshold'
      };
      
      const validated = RecommendationValidator.validateReorder(validReorder);
      expect(validated.recommendedQuantity).toBe(25);
      expect(validated.confidence).toBe(0.85);
    });

    it('should reject invalid reorder quantity (negative)', () => {
      const invalidReorder = {
        recommendedQuantity: -5,
        confidence: 0.85,
        reasoning: 'Invalid quantity'
      };
      
      expect(() => {
        RecommendationValidator.validateReorder(invalidReorder);
      }).toThrow('Reorder: recommendedQuantity must be positive');
    });
  });
});