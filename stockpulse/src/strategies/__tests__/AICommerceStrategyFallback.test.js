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

describe('AICommerceStrategy Fallback Tests Part 1', () => {
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

  it('should fallback to RuleBasedStrategy on LLM timeout', async () => {
    // Mock LLMClient to throw timeout error
    LLMClient.callLLM.mockRejectedValue(new Error('timeout of 10000ms exceeded'));
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('timeout');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
    expect(result.pricing.recommendedPrice).toBe(110); // 10% increase due to low stock
    expect(result.pricing.direction).toBe('INCREASE');
  });

  it('should fallback to RuleBasedStrategy on network error', async () => {
    // Mock LLMClient to throw network error
    LLMClient.callLLM.mockRejectedValue(new Error('Network Error'));
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('Network Error');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
    expect(result.pricing.recommendedPrice).toBe(110); // 10% increase due to low stock
    expect(result.pricing.direction).toBe('INCREASE');
  });

  it('should fallback to RuleBasedStrategy on HTTP 429/rate-limit error', async () => {
    // Mock LLMClient to throw rate limit error
    LLMClient.callLLM.mockRejectedValue(new Error('LLM API error: 429 - Too Many Requests'));
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('429');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });

  it('should fallback to RuleBasedStrategy on HTTP authentication/configuration error', async () => {
    // Mock LLMClient to throw auth error
    LLMClient.callLLM.mockRejectedValue(new Error('LLM API error: 401 - Unauthorized'));
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('401');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });
});