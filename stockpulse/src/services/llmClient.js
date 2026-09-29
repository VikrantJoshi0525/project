const axios = require('axios');

class LLMClient {
  constructor() {
    this.baseUrl = process.env.LLM_BASE_URL || 'https://litellm-qc.zycus.net/v1/chat/completions';
    this.apiKey = process.env.LLM_API_KEY;
    this.model = process.env.LLM_MODEL || 'qwen-cursor';
    
    // Validate configuration
    if (!this.apiKey) {
      throw new Error('LLM_API_KEY is required in environment variables');
    }
  }

  /**
   * Call the LLM with a prompt
   * @param {string} prompt - The prompt to send to the LLM
   * @param {string} productId - The product ID for tracking
   * @returns {Promise<Object>} The LLM response
   */
  async callLLM(prompt, productId) {
    try {
      const response = await axios.post(this.baseUrl, {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'product': 'PC1'
        },
        timeout: 10000 // 10 second timeout
      });

      return response.data;
    } catch (error) {
      // Log error without exposing API key
      const errorMessage = error.response ? 
        `LLM API error: ${error.response.status} - ${error.response.statusText}` :
        `LLM connection error: ${error.message}`;
      
      throw new Error(errorMessage);
    }
  }
}

module.exports = new LLMClient();