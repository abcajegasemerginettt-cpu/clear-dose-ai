import { GoogleGenerativeAI } from '@google/generative-ai';

interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  description: string;
  medicine_type: 'tablet' | 'capsule';
  variants: string[];
  side_effects: string[];
  storage: string;
  category: string;
  confidence?: number;
}

class GoogleAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY;
    console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
    
    if (!apiKey || apiKey === 'your-google-ai-studio-api-key-here') {
      throw new Error('Google AI Studio API key not configured. Please add your API key to the .env file.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async askAboutMedicine(question: string, medicine: Medicine): Promise<string> {
    try {
      // First, check if the question is medicine-related
      const isRelevantQuestion = await this.isMedicineRelatedQuestion(question, medicine);
      
      if (!isRelevantQuestion) {
        return "I'm a medical AI assistant designed to help with questions about medicines and healthcare. Please ask me something related to the scanned medicine, its usage, side effects, dosage, interactions, or general medical topics.";
      }

      const medicineContext = `
        Medicine Information:
        - Name: ${medicine.name}
        - Generic Name: ${medicine.generic_name}
        - Type: ${medicine.medicine_type}
        - Category: ${medicine.category}
        - Description: ${medicine.description}
        - Variants: ${medicine.variants.join(', ')}
        - Side Effects: ${medicine.side_effects.join(', ')}
        - Storage: ${medicine.storage}
      `;

      const prompt = `
        You are an expert medical AI assistant with comprehensive knowledge about medications, pharmacology, and healthcare. 
        
        The user has scanned this medicine:
        ${medicineContext}
        
        User Question: ${question}
        
        Instructions:
        1. If the user is greeting you (hi, hello, how are you, how can you help, etc.), respond naturally and friendly, then offer to help with questions about the scanned medicine or general medical topics
        2. Answer ONLY what the user specifically asked about - don't provide unrequested information
        3. Be concise and focused on their specific question
        4. If they ask about side effects, provide additional side effects beyond what's listed, but don't include dosage, interactions, etc. unless asked
        5. If they ask about dosage, focus only on dosage information
        6. Use bullet points for lists when appropriate
        7. Keep responses helpful but brief - around 3-5 sentences or a short bulleted list
        8. Only include a healthcare professional disclaimer when discussing dosage, drug interactions, contraindications, or serious medical advice
        9. For general informational questions (like "what is this medicine for?"), skip the disclaimer
        10. Use your medical knowledge to enhance the answer but stay focused on the specific question
        
        Remember: Be conversational for greetings, answer only what they asked, be concise, and only add disclaimers for medical advice that requires professional consultation.
      `;

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );

      const result = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Google AI:', error);
      if (error.message?.includes('timeout')) {
        throw new Error('AI response is taking too long. Please try again with a shorter question.');
      }
      throw new Error('Failed to get response from AI assistant. Please try again.');
    }
  }

  private async isMedicineRelatedQuestion(question: string, medicine: Medicine): Promise<boolean> {
    try {
      const prompt = `
        You are a question classifier. Your job is to determine if a user's question is related to medicine, healthcare, pharmaceuticals, or medical topics.

        The user has scanned this medicine: ${medicine.name} (${medicine.generic_name})
        
        User Question: "${question}"
        
        Determine if this question is related to:
        - The scanned medicine specifically
        - Medicine/pharmaceuticals in general
        - Healthcare topics
        - Medical conditions or symptoms
        - Drug interactions, side effects, dosage
        - Health and wellness topics
        - Basic greetings and conversational starters (hi, hello, how are you, how can you help, what can you do, etc.)
        
        Questions NOT related to medicine include:
        - Technology questions (unless medical technology)
        - Sports, entertainment, politics
        - Math, science (non-medical)
        - Personal life questions unrelated to health
        - Weather, travel, food (unless health-related)
        - Complex non-medical conversations
        
        Respond with ONLY "YES" if the question is medicine/health related OR a basic greeting/conversational starter, or "NO" if it's not.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text().trim().toUpperCase();
      
      return answer === 'YES';
    } catch (error) {
      console.error('Error checking question relevance:', error);
      // If we can't determine relevance, err on the side of caution and allow the question
      return true;
    }
  }

  async getGeneralMedicineInfo(question: string): Promise<string> {
    try {
      const prompt = `
        You are an expert medical AI assistant with comprehensive knowledge about medications, pharmacology, and healthcare.
        
        Question: ${question}
        
        Instructions:
        1. Provide comprehensive, evidence-based medical information
        2. Use your extensive knowledge of medications, conditions, and treatments
        3. Include relevant details about mechanisms of action, indications, contraindications
        4. Mention important safety considerations and warnings
        5. Use bullet points for lists when appropriate
        6. Always emphasize the importance of consulting healthcare professionals for personalized medical advice
        7. Be thorough but clear in your explanations
        
        Provide accurate, detailed medical information while maintaining appropriate medical disclaimers.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Google AI:', error);
      throw new Error('Failed to get response from AI assistant. Please try again.');
    }
  }
}

export const googleAIService = new GoogleAIService();
