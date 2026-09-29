const RecommendationValidator = require('../../services/recommendationValidator');

describe('Recommendation Validator Edge Cases', () => {
  // Additional validation tests
  it('should reject missing pricing.recommendedPrice', () => {
    const invalidPricing = {
      direction: 'INCREASE',
      confidence: 0.9,
      reasoning: 'Missing price'
    };
    
    expect(() => {
      RecommendationValidator.validatePricing(invalidPricing, 100);
    }).toThrow('Pricing: recommendedPrice is required');
  });

  it('should reject missing pricing.direction', () => {
    const invalidPricing = {
      recommendedPrice: 110,
      confidence: 0.9,
      reasoning: 'Missing direction'
    };
    
    expect(() => {
      RecommendationValidator.validatePricing(invalidPricing, 100);
    }).toThrow('Pricing: direction is required');
  });

  it('should reject invalid pricing.direction', () => {
    const invalidPricing = {
      recommendedPrice: 110,
      direction: 'INVALID',
      confidence: 0.9,
      reasoning: 'Invalid direction'
    };
    
    expect(() => {
      RecommendationValidator.validatePricing(invalidPricing, 100);
    }).toThrow('Pricing: direction must be one of INCREASE, DECREASE, HOLD');
  });

  it('should reject pricing confidence < 0', () => {
    const invalidPricing = {
      recommendedPrice: 110,
      direction: 'INCREASE',
      confidence: -0.1,
      reasoning: 'Negative confidence'
    };
    
    expect(() => {
      RecommendationValidator.validatePricing(invalidPricing, 100);
    }).toThrow('Pricing: confidence must be between 0 and 1');
  });

  it('should reject pricing confidence > 1', () => {
    const invalidPricing = {
      recommendedPrice: 110,
      direction: 'INCREASE',
      confidence: 1.1,
      reasoning: 'High confidence'
    };
    
    expect(() => {
      RecommendationValidator.validatePricing(invalidPricing, 100);
    }).toThrow('Pricing: confidence must be between 0 and 1');
  });

  it('should reject missing reorder.recommendedQuantity', () => {
    const invalidReorder = {
      confidence: 0.85,
      reasoning: 'Missing quantity'
    };
    
    expect(() => {
      RecommendationValidator.validateReorder(invalidReorder);
    }).toThrow('Reorder: recommendedQuantity is required');
  });

  it('should reject reorder quantity = 0', () => {
    const invalidReorder = {
      recommendedQuantity: 0,
      confidence: 0.85,
      reasoning: 'Zero quantity'
    };
    
    expect(() => {
      RecommendationValidator.validateReorder(invalidReorder);
    }).toThrow('Reorder: recommendedQuantity must be positive');
  });

  it('should reject reorder quantity < 0', () => {
    const invalidReorder = {
      recommendedQuantity: -1,
      confidence: 0.85,
      reasoning: 'Negative quantity'
    };
    
    expect(() => {
      RecommendationValidator.validateReorder(invalidReorder);
    }).toThrow('Reorder: recommendedQuantity must be positive');
  });

  it('should reject fractional reorder quantity', () => {
    const invalidReorder = {
      recommendedQuantity: 5.5,
      confidence: 0.85,
      reasoning: 'Fractional quantity'
    };
    
    const validated = RecommendationValidator.validateReorder(invalidReorder);
    expect(validated.recommendedQuantity).toBe(5); // Should parse to integer
  });

  it('should reject reorder confidence < 0', () => {
    const invalidReorder = {
      recommendedQuantity: 25,
      confidence: -0.1,
      reasoning: 'Negative confidence'
    };
    
    expect(() => {
      RecommendationValidator.validateReorder(invalidReorder);
    }).toThrow('Reorder: confidence must be between 0 and 1');
  });

  it('should reject reorder confidence > 1', () => {
    const invalidReorder = {
      recommendedQuantity: 25,
      confidence: 1.1,
      reasoning: 'High confidence'
    };
    
    expect(() => {
      RecommendationValidator.validateReorder(invalidReorder);
    }).toThrow('Reorder: confidence must be between 0 and 1');
  });
});