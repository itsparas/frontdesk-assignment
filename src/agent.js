/**
 * Salon AI Agent with Human-in-the-Loop Escalation
 * 
 * This agent can:
 * - Receive calls
 * - Respond if it knows the answer from the knowledge base
 * - Trigger a "request help" event if it doesn't know
 */

import {
  WorkerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import knowledgeBase from './services/knowledgeBase.js';
import helpRequestService from './services/helpRequestService.js';

dotenv.config({ path: '.env' });

/**
 * Salon Assistant Agent
 * Handles customer inquiries with intelligent escalation
 */
class SalonAssistant extends voice.Agent {
  constructor() {
    super({
      instructions: `You are a helpful and friendly AI receptionist for Glamour Salon, a premier hair salon.

Your responsibilities:
1. Answer customer questions about the salon's services, hours, pricing, location, and booking process
2. Be warm, professional, and concise in your responses
3. If a customer asks a question you're not sure about or that's not in your knowledge base, you MUST tell them: "Let me check with my supervisor and get back to you"
4. Never make up information or guess - always escalate to a supervisor if you're uncertain

Important guidelines:
- Keep responses conversational and friendly
- Avoid complex formatting, emojis, or special characters in speech
- Be brief but informative
- Always confirm important details like appointment times or prices

Remember: It's better to escalate to a supervisor than to provide incorrect information.`,
    });
    
    this.knowledgeBase = knowledgeBase;
    this.helpRequestService = helpRequestService;
    this.currentCallerId = null;
    this.currentCallerPhone = null;
  }

  /**
   * Set caller information for the current session
   */
  setCallerInfo(callerId, callerPhone) {
    this.currentCallerId = callerId;
    this.currentCallerPhone = callerPhone;
  }

  /**
   * Check if the agent can answer a question from its knowledge base
   * This is called before the agent responds
   */
  async canAnswerQuestion(question) {
    const answer = this.knowledgeBase.search(question);
    return answer !== null;
  }

  /**
   * Request help from supervisor when agent doesn't know the answer
   */
  async requestHelp(question) {
    console.log('\n[SalonAgent] 🆘 ESCALATING TO SUPERVISOR');
    console.log(`[SalonAgent] Question: "${question}"`);
    
    const helpRequest = this.helpRequestService.createRequest({
      question,
      callerId: this.currentCallerId || 'Unknown Caller',
      callerPhone: this.currentCallerPhone || 'Unknown Number',
    });

    return helpRequest;
  }
}

/**
 * Main agent entrypoint
 * Sets up the voice session and starts the agent
 */
export default defineAgent({
  prewarm: async (proc) => {
    // Pre-load the VAD model for faster startup
    proc.userData.vad = await silero.VAD.load();
  },
  
  entry: async (ctx) => {
    const vad = ctx.proc.userData.vad;
    
    // Create the salon assistant
    const assistant = new SalonAssistant();
    
    // Set caller info from room metadata if available
    const metadata = ctx.room.metadata;
    if (metadata) {
      try {
        const data = JSON.parse(metadata);
        assistant.setCallerInfo(data.callerId || 'Guest', data.callerPhone || 'N/A');
      } catch (e) {
        assistant.setCallerInfo('Guest', 'N/A');
      }
    } else {
      assistant.setCallerInfo('Guest', 'N/A');
    }

    // Set up the voice session with STT-LLM-TTS pipeline
    const session = new voice.AgentSession({
      vad,
      stt: "assemblyai/universal-streaming:en",
      llm: "openai/gpt-4.1-mini",
      tts: "cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
      turnDetection: new livekit.turnDetector.MultilingualModel(),
    });

    // Start the session
    await session.start({
      agent: assistant,
      room: ctx.room,
      inputOptions: {
        // Use background voice cancellation for clear audio
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    await ctx.connect();

    // Generate initial greeting
    const handle = session.generateReply({
      instructions: 'Greet the caller warmly and introduce yourself as the AI receptionist for Glamour Salon. Offer to help them with their questions about services, hours, pricing, or appointments.',
    });

    console.log('\n========================================');
    console.log('✅ Salon AI Agent Started');
    console.log('========================================');
    console.log('Agent is ready to receive calls');
    console.log('Knowledge Base loaded with salon info');
    console.log('Help Request System initialized');
    console.log('========================================\n');
  },
});

// Run the agent with explicit dispatch for telephony
cli.runApp(new WorkerOptions({ 
  agent: fileURLToPath(import.meta.url),
  // Agent name is required for explicit dispatch (telephony integration)
  agentName: "salon-receptionist"
}));
