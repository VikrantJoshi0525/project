const RecommendationHandlerService = require('../../services/recommendationHandlerService');
const Product = require('../../models/Product');
const PricingSuggestion = require('../../models/PricingSuggestion');
const ReorderSuggestion = require('../../models/ReorderSuggestion');
const CommerceAdvisorService = require('../../services/commerceAdvisorService');
const { SUGGESTION_STATUS, TRIGGER_REASON } = require('../../utils/constants');

// Mock the models and services
jest.mock('../../models/Product');
jest.mock('../../models/PricingSuggestion');
jest.mock('../../models/ReorderSuggestion');
jest.mock('../../services/commerceAdvisorService');

describe('RecommendationHandlerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleInventoryLow', () => {
    it('should create both pricing and reorder suggestions for inventory low event', async () => {
      const eventPayload = { productId: 'test-product-id' };
      const mockProduct = {
        _id: 'test-product-id',
        toObject: jest.fn().mockReturnValue({ id: 'test-product-id', category: 'ELECTRONICS' })
      };
      const mockRecommendations = {
        pricing: {
          currentPrice: 100,
          recommendedPrice: 110,
          direction: 'INCREASE',
          confidence: 0.9,
          reasoning: 'Low inventory detected'
        },
        reorder: {
          currentStock: 5,
          recommendedQuantity: 25,
          suggestedLeadTimeDays: 3,
          confidence: 0.85,
          reasoning: 'Calculated reorder quantity'
        }
      };

      Product.findById.mockResolvedValue(mockProduct);
      CommerceAdvisorService.getCategoryAverageDemandVelocity.mockResolvedValue(5);
      CommerceAdvisorService.getRecommendations.mockResolvedValue(mockRecommendations);
      PricingSuggestion.findOne.mockResolvedValue(null);
      ReorderSuggestion.findOne.mockResolvedValue(null);
      PricingSuggestion.prototype.save = jest.fn();
      ReorderSuggestion.prototype.save = jest.fn();

      await RecommendationHandlerService.handleInventoryLow(eventPayload);

      // Verify product was fetched
      expect(Product.findById).toHaveBeenCalledWith('test-product-id');
      
      // Verify recommendations were generated
      expect(CommerceAdvisorService.getCategoryAverageDemandVelocity).toHaveBeenCalledWith('ELECTRONICS');
      expect(CommerceAdvisorService.getRecommendations).toHaveBeenCalled();
      
      // Verify suggestions were created
      expect(PricingSuggestion.prototype.save).toHaveBeenCalled();
      expect(ReorderSuggestion.prototype.save).toHaveBeenCalled();
    });

    it('should skip creating duplicate pending pricing suggestions', async () => {
      const eventPayload = { productId: 'test-product-id' };
      const mockProduct = {
        _id: 'test-product-id',
        toObject: jest.fn().mockReturnValue({ id: 'test-product-id', category: 'ELECTRONICS' })
      };
      const mockRecommendations = {
        pricing: {
          currentPrice: 100,
          recommendedPrice: 110,
          direction: 'INCREASE',
          confidence: 0.9,
          reasoning: 'Low inventory detected'
        },
        reorder: {
          currentStock: 5,
          recommendedQuantity: 25,
          suggestedLeadTimeDays: 3,
          confidence: 0.85,
          reasoning: 'Calculated reorder quantity'
        }
      };
      const mockExistingSuggestion = { _id: 'existing-suggestion-id' };

      Product.findById.mockResolvedValue(mockProduct);
      CommerceAdvisorService.getCategoryAverageDemandVelocity.mockResolvedValue(5);
      CommerceAdvisorService.getRecommendations.mockResolvedValue(mockRecommendations);
      PricingSuggestion.findOne.mockResolvedValue(mockExistingSuggestion);
      ReorderSuggestion.findOne.mockResolvedValue(null);
      ReorderSuggestion.prototype.save = jest.fn();

      await RecommendationHandlerService.handleInventoryLow(eventPayload);

      // Verify duplicate pricing suggestion was detected
      expect(PricingSuggestion.findOne).toHaveBeenCalledWith({
        product: 'test-product-id',
        triggerReason: TRIGGER_REASON.INVENTORY_LOW,
        status: SUGGESTION_STATUS.PENDING
      });
      
      // Verify pricing suggestion was not created
      expect(PricingSuggestion.prototype.save).not.toHaveBeenCalled();
      
      // Verify reorder suggestion was still created
      expect(ReorderSuggestion.prototype.save).toHaveBeenCalled();
    });
  });
});