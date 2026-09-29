class ResponseParser {
  /**
   * Parse LLM response and extract JSON
   * @param {string|Object} response - The LLM response
   * @returns {Object} Parsed JSON object
   * @throws {Error} If parsing fails
   */
  static parseResponse(response) {
    try {
      let jsonString;
      
      // Handle different response formats
      if (typeof response === 'string') {
        jsonString = response;
      } else if (typeof response === 'object') {
        // If it's already a parsed object, convert to string first
        if (response.choices && response.choices[0] && response.choices[0].message) {
          jsonString = response.choices[0].message.content;
        } else {
          jsonString = JSON.stringify(response);
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      // Remove markdown code fences if present
      jsonString = jsonString.replace(/```json\s*|\s*```/g, '').trim();
      
      // Parse JSON
      const parsed = JSON.parse(jsonString);
      
      // Validate required structure
      if (!parsed.pricing || !parsed.reorder) {
        throw new Error('Missing required pricing or reorder objects');
      }
      
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }
}

module.exports = ResponseParser;