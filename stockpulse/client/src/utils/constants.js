// Constants for the frontend

// Product lifecycle states
export const PRODUCT_LIFECYCLE = {
  ACTIVE: 'ACTIVE',
  PRICE_REVIEW_PENDING: 'PRICE_REVIEW_PENDING',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
};

// Suggestion statuses
export const SUGGESTION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

// Product categories
export const PRODUCT_CATEGORY = {
  ELECTRONICS: 'ELECTRONICS',
  APPAREL: 'APPAREL',
  HOME: 'HOME'
};

// Pricing directions
export const PRICING_DIRECTION = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
  HOLD: 'HOLD'
};

// Trigger reasons
export const TRIGGER_REASON = {
  INITIAL: 'INITIAL',
  INVENTORY_LOW: 'INVENTORY_LOW',
  DEMAND_SPIKE: 'DEMAND_SPIKE',
  MANUAL: 'MANUAL'
};