// Simple product model simulation
class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.currentPrice = data.currentPrice;
    this.stockLevel = data.stockLevel;
    this.reorderThreshold = data.reorderThreshold;
    this.demandVelocity = data.demandVelocity;
  }
  
  // Simulate saving to database
  save() {
    // In a real implementation, this would save to MongoDB
    return Promise.resolve(this);
  }
  
  // Static method to find by ID
  static findById(id) {
    // In a real implementation, this would query MongoDB
    // For now, we'll return a mock product
    const mockProducts = {
      '1': {
        id: '1',
        name: 'Wireless Headphones',
        category: 'Electronics',
        currentPrice: 99.99,
        stockLevel: 50,
        reorderThreshold: 20,
        demandVelocity: 5
      },
      '2': {
        id: '2',
        name: 'Smartphone Case',
        category: 'Electronics',
        currentPrice: 29.99,
        stockLevel: 15,
        reorderThreshold: 30,
        demandVelocity: 15
      },
      '3': {
        id: '3',
        name: 'Coffee Mug',
        category: 'Home & Kitchen',
        currentPrice: 12.99,
        stockLevel: 100,
        reorderThreshold: 50,
        demandVelocity: 8
      }
    };
    
    const productData = mockProducts[id];
    return productData ? new Product(productData) : null;
  }
  
  // Static method to calculate category average demand velocity
  static async getCategoryAverageDemandVelocity(category) {
    // In a real implementation, this would query MongoDB to calculate average
    // For now, we'll return mock values based on category
    const categoryAverages = {
      'Electronics': 10,
      'Home & Kitchen': 5,
      'Clothing': 8,
      'Books': 3
    };
    
    return categoryAverages[category] || 5;
  }
}

module.exports = Product;