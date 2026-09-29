# ADR: Pluggable Commerce Engine Architecture

## Status
Accepted

## Context
We need to implement a pluggable commerce engine for StockPulse that can support multiple recommendation strategies. The system should allow for:
- Easy switching between different strategies at runtime
- Consistent interface for both pricing and reorder recommendations
- Shared contract between HTTP endpoints and future async event handlers
- Extensibility for future AI-based strategies

## Options Considered

### Option 1: Single Unified CommerceAdvisor Contract
Create one unified contract that returns both pricing and reorder recommendations, with a strategy pattern for implementation.

### Option 2: Separate Pricing and Reorder Contracts
Create separate contracts for pricing and reorder recommendations, each with their own strategy patterns.

### Option 3: Direct Strategy Usage in Controllers
Use strategies directly in controllers without an advisor abstraction.

## Decision
We chose **Option 1: Single Unified CommerceAdvisor Contract** for the following reasons:

1. **Consistency**: Both HTTP endpoints and future async handlers use the same contract
2. **Maintainability**: Single point of entry for all commerce recommendations
3. **Extensibility**: Easy to add new strategies without changing caller code
4. **Runtime Switching**: Centralized strategy management enables runtime configuration
5. **Business Alignment**: Pricing and reorder decisions are often related in commerce

## Tradeoffs

### Pros
- Single interface simplifies caller code
- Enables runtime strategy switching without server restart
- Clear separation between strategy implementation and persistence
- Ready for future AI/LLM integration
- Strategies remain pure business logic without infrastructure concerns

### Cons
- Slightly more complex initial setup
- Both pricing and reorder recommendations are coupled in the response
- May return more data than needed for single-recommendation use cases

## Strategy Pattern Implementation

### CommerceStrategy Interface
```javascript
class CommerceStrategy {
  getRecommendations(context)
}
```

### Context Structure
```javascript
{
  product: { /* product data */ },
  categoryAverageDemandVelocity: Number,
  triggerReason: String
}
```

### Recommendation Structure
```javascript
{
  pricing: {
    currentPrice: Number,
    recommendedPrice: Number,
    direction: 'INCREASE|DECREASE|HOLD',
    confidence: Number,
    reasoning: String
  },
  reorder: {
    currentStock: Number,
    recommendedQuantity: Number,
    suggestedLeadTimeDays: Number,
    confidence: Number,
    reasoning: String
  },
  triggerReason: String
}
```

## Runtime Strategy Switching

### Configuration Endpoints
- `GET /config/strategy` - Get current strategy
- `PATCH /config/strategy` - Update active strategy

### Implementation
- StrategyRegistry manages registered strategies
- Active strategy can be changed without server restart
- Validation ensures only registered strategies can be activated

## Future Considerations

### AI Strategy Integration
The architecture is ready for AI-based strategies:
- New strategies can be registered without changing existing code
- AI strategies will follow the same interface
- Strategy switching allows A/B testing of AI vs rule-based approaches

### Event-Driven Architecture
The unified CommerceAdvisor contract will work seamlessly with future async event handlers:
- Same input context structure
- Same output recommendation format
- No modification needed when moving from HTTP to event-driven processing