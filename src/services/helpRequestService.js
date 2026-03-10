/**
 * Help Request Service
 * Manages escalation requests when the AI doesn't know the answer
 */

import { v4 as uuidv4 } from 'uuid';

export class HelpRequestService {
  constructor() {
    // In-memory storage for demo - would use DynamoDB/Firebase in production
    this.requests = new Map();
  }

  /**
   * Create a new help request
   * @param {Object} params
   * @param {string} params.question - The question that needs answering
   * @param {string} params.callerId - Identifier for the caller
   * @param {string} params.callerPhone - Phone number to text back (simulated)
   * @returns {Object} - The created help request
   */
  createRequest({ question, callerId, callerPhone }) {
    const requestId = uuidv4();
    const request = {
      id: requestId,
      question,
      callerId,
      callerPhone,
      status: 'pending', // pending, resolved, unresolved
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      answer: null,
      supervisorNote: null,
    };

    this.requests.set(requestId, request);

    // Simulate texting the supervisor
    this.notifySupervisor(request);

    console.log(`[HelpRequest] Created new request ${requestId}`);
    console.log(`[HelpRequest] Question: "${question}"`);
    
    return request;
  }

  /**
   * Simulate sending a text to the supervisor
   * @param {Object} request - The help request
   */
  notifySupervisor(request) {
    console.log('\n========================================');
    console.log('📱 SIMULATED TEXT TO SUPERVISOR');
    console.log('========================================');
    console.log(`To: Supervisor`);
    console.log(`Message: Hey, I need help answering this question:`);
    console.log(`"${request.question}"`);
    console.log(`Request ID: ${request.id}`);
    console.log(`Caller: ${request.callerId} (${request.callerPhone})`);
    console.log('========================================\n');
  }

  /**
   * Resolve a help request with an answer
   * @param {string} requestId - The request ID
   * @param {string} answer - The answer from the supervisor
   * @param {string} supervisorNote - Optional note from supervisor
   * @returns {Object|null} - The updated request or null if not found
   */
  resolveRequest(requestId, answer, supervisorNote = null) {
    const request = this.requests.get(requestId);
    
    if (!request) {
      console.error(`[HelpRequest] Request ${requestId} not found`);
      return null;
    }

    request.status = 'resolved';
    request.answer = answer;
    request.supervisorNote = supervisorNote;
    request.resolvedAt = new Date().toISOString();

    // Simulate texting the caller back
    this.notifyCaller(request);

    console.log(`[HelpRequest] Resolved request ${requestId}`);
    
    return request;
  }

  /**
   * Simulate sending a text back to the caller
   * @param {Object} request - The resolved help request
   */
  notifyCaller(request) {
    console.log('\n========================================');
    console.log('📱 SIMULATED TEXT TO CALLER');
    console.log('========================================');
    console.log(`To: ${request.callerId} (${request.callerPhone})`);
    console.log(`Message: Thanks for your patience! Here's the answer to your question:`);
    console.log(`"${request.answer}"`);
    console.log('========================================\n');
  }

  /**
   * Mark a request as unresolved (timeout or unable to answer)
   * @param {string} requestId - The request ID
   * @returns {Object|null} - The updated request or null if not found
   */
  markUnresolved(requestId) {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return null;
    }

    request.status = 'unresolved';
    request.resolvedAt = new Date().toISOString();

    console.log(`[HelpRequest] Marked request ${requestId} as unresolved`);
    
    return request;
  }

  /**
   * Get all requests with optional status filter
   * @param {string} status - Optional status filter ('pending', 'resolved', 'unresolved')
   * @returns {Array} - Array of requests
   */
  getRequests(status = null) {
    const allRequests = Array.from(this.requests.values());
    
    if (status) {
      return allRequests.filter(req => req.status === status);
    }
    
    return allRequests;
  }

  /**
   * Get a specific request by ID
   * @param {string} requestId - The request ID
   * @returns {Object|null} - The request or null if not found
   */
  getRequest(requestId) {
    return this.requests.get(requestId) || null;
  }

  /**
   * Get pending requests count
   * @returns {number}
   */
  getPendingCount() {
    return this.getRequests('pending').length;
  }
}

export default new HelpRequestService();
