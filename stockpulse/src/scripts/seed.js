const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const connectDB = require('../config/db');

// Sample seed data (since Addendum A is not available)
const seedProducts = [
  {
    sku: 'ELEC-001',
    name: 'Smartphone X1',
    category: 'ELECTRONICS',
    currentPrice: 699.99,
    stockLevel: 25,
    reorderThreshold: 10,
    demandVelocity: 5,
    costPrice: 450.00,
    supplierId: 'SUPP-001'
  },
  {
    sku: 'ELEC-002',
    name: 'Wireless Headphones Pro',
    category: 'ELECTRONICS',
    currentPrice: 199.99,
    stockLevel: 2, // Near reorder threshold for testing
    reorderThreshold: 5,
    demandVelocity: 8,
    costPrice: 120.00,
    supplierId: 'SUPP-002'
  },
  {
    sku: 'APP-001',
    name: 'Premium Cotton T-Shirt',
    category: 'APPAREL',
    currentPrice: 29.99,
    stockLevel: 50,
    reorderThreshold: 20,
    demandVelocity: 12,
    costPrice: 15.00,
    supplierId: 'SUPP-003'
  },
  {
    sku: 'APP-002',
    name: 'Denim Jeans Classic Fit',
    category: 'APPAREL',
    currentPrice: 79.99,
    stockLevel: 15,
    reorderThreshold: 8,
    demandVelocity: 3,
    costPrice: 40.00,
    supplierId: 'SUPP-003'
  },
  {
    sku: 'HOME-001',
    name: 'Ceramic Coffee Mug Set',
    category: 'HOME',
    currentPrice: 24.99,
    stockLevel: 30,
    reorderThreshold: 15,
    demandVelocity: 2,
    costPrice: 12.00,
    supplierId: 'SUPP-004'
  },
  {
    sku: 'HOME-002',
    name: 'Throw Pillow Decorative',
    category: 'HOME',
    currentPrice: 18.99,
    stockLevel: 0, // Out of stock
    reorderThreshold: 10,
    demandVelocity: 1,
    costPrice: 8.00,
    supplierId: 'SUPP-004'
  },
  {
    sku: 'ELEC-003',
    name: 'Tablet Ultra Slim',
    category: 'ELECTRONICS',
    currentPrice: 349.99,
    stockLevel: 8,
    reorderThreshold: 5,
    demandVelocity: 4,
    costPrice: 220.00,
    supplierId: 'SUPP-001'
  },
  {
    sku: 'APP-003',
    name: 'Winter Jacket Waterproof',
    category: 'APPAREL',
    currentPrice: 149.99,
    stockLevel: 12,
    reorderThreshold: 6,
    demandVelocity: 1,
    costPrice: 80.00,
    supplierId: 'SUPP-003'
  }
];

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert seed products
    const products = await Product.insertMany(seedProducts);
    console.log(`${products.length} products seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;