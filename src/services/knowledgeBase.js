/**
 * Knowledge Base Service
 * Stores and retrieves known information about the salon
 */

export class KnowledgeBase {
  constructor() {
    // Initial salon knowledge
    this.knowledge = new Map([
      ['hours', 'We are open Monday to Friday 9 AM to 7 PM, Saturday 10 AM to 6 PM, and closed on Sundays.'],
      ['location', 'We are located at 123 Main Street, Downtown.'],
      ['services', 'We offer haircuts, styling, coloring, highlights, keratin treatments, and special occasion styling.'],
      ['pricing_haircut', 'Haircuts start at $45 for adults and $25 for children under 12.'],
      ['pricing_color', 'Hair coloring services start at $85, depending on length and complexity.'],
      ['booking', 'You can book an appointment by calling us at 555-0123 or through our website at glamoursalon.com.'],
      ['cancellation', 'We require 24 hours notice for cancellations. Late cancellations may incur a fee.'],
      ['stylists', 'We have 5 experienced stylists: Maria (10 years), James (8 years), Sophie (6 years), Alex (5 years), and Emma (3 years).'],
    ]);
  }

  /**
   * Search the knowledge base for relevant information
   * @param {string} query - The user's question
   * @returns {string|null} - The answer if found, null otherwise
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    
    // Simple keyword matching - can be enhanced with semantic search later
    const keywords = {
      'hours': ['hour', 'open', 'close', 'time', 'when'],
      'location': ['where', 'location', 'address', 'find'],
      'services': ['service', 'offer', 'what do you', 'treatments'],
      'pricing_haircut': ['haircut price', 'haircut cost', 'how much haircut'],
      'pricing_color': ['color price', 'color cost', 'coloring', 'how much color'],
      'booking': ['book', 'appointment', 'schedule', 'reserve'],
      'cancellation': ['cancel', 'reschedule', 'change appointment'],
      'stylists': ['stylist', 'who works', 'staff', 'hairdresser'],
    };

    // Find matching knowledge
    for (const [key, searchTerms] of Object.entries(keywords)) {
      if (searchTerms.some(term => lowerQuery.includes(term))) {
        return this.knowledge.get(key);
      }
    }

    return null;
  }

  /**
   * Add new knowledge to the base
   * @param {string} key - The knowledge identifier
   * @param {string} value - The information
   */
  add(key, value) {
    this.knowledge.set(key, value);
    console.log(`[KnowledgeBase] Added new knowledge: ${key}`);
  }

  /**
   * Get all knowledge entries
   * @returns {Array} - All knowledge entries
   */
  getAll() {
    return Array.from(this.knowledge.entries()).map(([key, value]) => ({
      key,
      value
    }));
  }

  /**
   * Check if we have information about a topic
   * @param {string} query - The user's question
   * @returns {boolean}
   */
  hasKnowledge(query) {
    return this.search(query) !== null;
  }
}

export default new KnowledgeBase();
