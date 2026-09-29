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

describe('AICommerceStrategy Fallback Tests Part 3', () => {
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

  it('should fallback to RuleBasedStrategy on invalid pricing confidence', async () => {
    // Mock successful LLM call but invalid confidence
    LLMClient.callLLM.mockResolvedValue({ data: 'valid json' });
    ResponseParser.parseResponse.mockReturnValue({
      pricing: { recommendedPrice: 110, direction: 'INCREASE', confidence: 1.5, reasoning: 'test' },
      reorder: { recommendedQuantity: 25, confidence: 0.85, reasoning: 'test' }
    });
    RecommendationValidator.validateRecommendation.mockImplementation(() => {
      throw new Error('Pricing: confidence must be between 0 and 1');
    });
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('confidence must be between 0 and 1');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });

  it('should fallback to RuleBasedStrategy on unsafe recommended price > 10x current price', async () => {
    // Mock successful LLM call but unsafe price
    LLMClient.callLLM.mockResolvedValue({ data: 'valid json' });
    ResponseParser.parseResponse.mockReturnValue({
      pricing: { recommendedPrice: 1500, direction: 'INCREASE', confidence: 0.9, reasoning: 'test' },
      reorder: { recommendedQuantity: 25, confidence: 0.85, reasoning: 'test' }
    });
    RecommendationValidator.validateRecommendation.mockImplementation(() => {
      throw new Error('Pricing: recommendedPrice is unsafe (more than 10x current price)');
    });
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('unsafe');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });

  it('should fallback to RuleBasedStrategy on invalid reorder quantity', async () => {
    // Mock successful LLM call but invalid reorder quantity
    LLMClient.callLLM.mockResolvedValue({ data: 'valid json' });
    ResponseParser.parseResponse.mockReturnValue({
      pricing: { recommendedPrice: 110, direction: 'INCREASE', confidence: 0.9, reasoning: 'test' },
      reorder: { recommendedQuantity: -5, confidence: 0.85, reasoning: 'test' }
    });
    RecommendationValidator.validateRecommendation.mockImplementation(() => {
      throw new Error('Reorder: recommendedQuantity must be positive');
    });
    
    const result = await aiStrategy.getRecommendations(testContext);
    
    // Verify fallback occurred
    expect(result.fallback).toBe(true);
    expect(result.fallbackReason).toContain('recommendedQuantity must be positive');
    // Verify it's a valid recommendation from RuleBasedStrategy
    expect(result.pricing).toBeDefined();
    expect(result.reorder).toBeDefined();
  });
});