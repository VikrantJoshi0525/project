const { PRODUCT_CATEGORY, PRODUCT_LIFECYCLE } = require('../utils/constants');

const isValidCategory = (category) => {
  return Object.values(PRODUCT_CATEGORY).includes(category);
};

const isValidLifecycle = (lifecycle) => {
  return Object.values(PRODUCT_LIFECYCLE).includes(lifecycle);
};

const isValidSku = (sku) => {
  return typeof sku === 'string' && sku.trim().length > 0;
};

const isValidNonNegativeNumber = (value) => {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
};

const isValidPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

const isValidNonNegativeInteger = (value) => {
  return Number.isInteger(value) && value >= 0;
};

module.exports = {
  isValidCategory,
  isValidLifecycle,
  isValidSku,
  isValidNonNegativeNumber,
  isValidPositiveInteger,
  isValidNonNegativeInteger
};