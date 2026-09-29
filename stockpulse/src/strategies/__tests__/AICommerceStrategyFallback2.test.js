const AICommerceStrategy = require('../../strategies/AICommerceStrategy');
const LLMClient = require('../../services/llmClient');
const ResponseParser = require('../../services/responseParser');
const RecommendationValidator = require('../../services/recommendationValidator');

// Mock the LLMClient
jest.mock('../../services/llmClient');
// Mock the ResponseParser
jest.mock('../../services/responseParser');
// Mock the RecommendationValidator
jest.mock('../../services/recommendationValidator');

describe('AICommerceStrategy Fallback Tests Part 2', () => {
  let aiStrategy;
  const testContext = {
    product: {
      _id: 'test-product-id',
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

  beforeEach(() => {
    aiStrategy = new AICommerceStrategy();
    jest.clearAllMocks();
  });

  it('should fallback to RuleBasedStrategy on malformed JSON response', async () => {
    // Mock successful LLM call but malformed response
    LLMClient.callLLM.mockResolvedValue({ data: 'invalid json' });
    ResponseParser.parseResponse.mockImplementation(() => {
      throw new Error('Failed to parse LLM response: Unexpected token');
    });
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('Failed to parse');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });

  it('should fallback to RuleBasedStrategy on missing required response fields', async () => {
    // Mock successful LLM call but incomplete response
    LLMClient.callLLM.mockResolvedValue({ data: '{"pricing": {}, "reorder": {}}' });
    ResponseParser.parseResponse.mockReturnValue({ pricing: {}, reorder: {} });
    RecommendationValidator.validateRecommendation.mockImplementation(() => {
      throw new Error('Recommendation must contain pricing and reorder objects');
    });
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('Recommendation must contain');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });

  it('should fallback to RuleBasedStrategy on invalid pricing direction', async () => {
    // Mock successful LLM call but invalid direction
    LLMClient.callLLM.mockResolvedValue({ data: 'valid json' });
    ResponseParser.parseResponse.mockReturnValue({
      pricing: { recommendedPrice: 110, direction: 'INVALID', confidence: 0.9, reasoning: 'test' },
      reorder: { recommendedQuantity: 25, confidence: 0.85, reasoning: 'test' }
    });
    RecommendationValidator.validateRecommendation.mockImplementation(() => {
      throw new Error('Pricing: direction must be one of INCREASE, DECREASE, HOLD');
    });
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('direction must be one of');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });
});