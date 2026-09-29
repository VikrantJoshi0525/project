// Utility functions for formatting data

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (value) => {
  return `${Math.round(value * 100)}%`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'badge-success';
    case 'PRICE_REVIEW_PENDING':
      return 'badge-warning';
    case 'OUT_OF_STOCK':
      return 'badge-danger';
    case 'PENDING':
      return 'badge-info';
    case 'ACCEPTED':
      return 'badge-success';
    case 'REJECTED':
      return 'badge-secondary';
    default:
      return 'badge-secondary';
  }
};

export const getTriggerBadgeClass = (trigger) => {
  switch (trigger) {
    case 'INVENTORY_LOW':
      return 'badge-warning';
    case 'DEMAND_SPIKE':
      return 'badge-danger';
    case 'MANUAL':
      return 'badge-primary';
    case 'INITIAL':
      return 'badge-info';
    default:
      return 'badge-secondary';
  }
};

export const getPricingDirectionClass = (direction) => {
  switch (direction) {
    case 'INCREASE':
      return 'badge-danger';
    case 'DECREASE':
      return 'badge-success';
    case 'HOLD':
      return 'badge-secondary';
    default:
      return 'badge-secondary';
  }
};

export const formatTriggerReason = (trigger) => {
  switch (trigger) {
    case 'INVENTORY_LOW':
      return 'Inventory Low';
    case 'DEMAND_SPIKE':
      return 'Demand Spike';
    case 'MANUAL':
      return 'Manual';
    case 'INITIAL':
      return 'Initial';
    default:
      return trigger;
  }
};

export const calculateStockHealth = (stockLevel, reorderThreshold) => {
  if (stockLevel === 0) return 'OUT_OF_STOCK';
  if (stockLevel < reorderThreshold) return 'LOW';
  if (stockLevel < reorderThreshold * 2) return 'MEDIUM';
  return 'HEALTHY';
};

export const getStockHealthClass = (health) => {
  switch (health) {
    case 'HEALTHY':
      return 'text-success';
    case 'MEDIUM':
      return 'text-warning';
    case 'LOW':
      return 'text-warning font-bold';
    case 'OUT_OF_STOCK':
      return 'text-danger font-bold';
    default:
      return '';
  }
};