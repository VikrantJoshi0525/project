class PromptBuilder {
  /**
   * Build inventory-low prompt
   * @param {Object} context - The product context
   * @returns {string} The formatted prompt
   */
  static buildInventoryLowPrompt(context) {
    const { product, categoryAverageDemandVelocity } = context;
    
    return `You are an expert commerce advisor for inventory management. 
Given the following product information where inventory is below/near the reorder threshold, 
make a merchandising decision that considers inventory protection and demand.

Product Information:
- Name: ${product.name}
- Category: ${product.category}
- Current Price: $${product.currentPrice}
- Current Stock Level: ${product.stockLevel}
- Reorder Threshold: ${product.reorderThreshold}
- Current Demand Velocity: ${product.demandVelocity}
- Category Average Demand Velocity: ${categoryAverageDemandVelocity}

Goal: Evaluate whether a modest price increase, HOLD, or another valid pricing decision is appropriate.
Also determine appropriate reorder quantity based on current stock, reorder threshold, demand velocity and category context.

Instructions:
1. Respond ONLY with valid JSON
2. Do not include markdown, code fences, or explanations outside the JSON object
3. Use the exact JSON structure provided

Required JSON response format:
{
  "pricing": {
    "recommendedPrice": number,
    "direction": "INCREASE" | "DECREASE" | "HOLD",
    "confidence": number,
    "reasoning": string
  },
  "reorder": {
    "recommendedQuantity": integer,
    "confidence": number,
    "reasoning": string
  }
}`;
  }

  /**
   * Build demand-spike prompt
   * @param {Object} context - The product context
   * @returns {string} The formatted prompt
   */
  static buildDemandSpikePrompt(context) {
    const { product, categoryAverageDemandVelocity } = context;
    
    return `You are an expert commerce advisor for inventory management. 
Given the following product information where demand velocity is significantly above the category average, 
capitalize on increased demand while avoiding an excessive price change.

Product Information:
- Name: ${product.name}
- Category: ${product.category}
- Current Price: $${product.currentPrice}
- Current Stock Level: ${product.stockLevel}
- Reorder Threshold: ${product.reorderThreshold}
- Current Demand Velocity: ${product.demandVelocity}
- Category Average Demand Velocity: ${categoryAverageDemandVelocity}

Goal: Consider a modest pricing response and appropriate replenishment.
Also determine reorder quantity considering demand velocity, current stock and threshold.

Instructions:
1. Respond ONLY with valid JSON
2. Do not include markdown, code fences, or explanations outside the JSON object
3. Use the exact JSON structure provided

Required JSON response format:
{
  "pricing": {
    "recommendedPrice": number,
    "direction": "INCREASE" | "DECREASE" | "HOLD",
    "confidence": number,
    "reasoning": string
  },
  "reorder": {
    "recommendedQuantity": integer,
    "confidence": number,
    "reasoning": string
  }
}`;
  }

  /**
   * Build prompt based on trigger reason
   * @param {Object} context - The product context
   * @returns {string} The formatted prompt
   */
  static buildPrompt(context) {
    const { triggerReason } = context;
    
    switch (triggerReason) {
      case 'INVENTORY_LOW':
        return this.buildInventoryLowPrompt(context);
      case 'DEMAND_SPIKE':
        return this.buildDemandSpikePrompt(context);
      default:
        // For MANUAL or other triggers, use inventory-low prompt as default
        return this.buildInventoryLowPrompt(context);
    }
  }
}

module.exports = PromptBuilder;