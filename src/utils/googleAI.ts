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
        1. Answer ONLY what the user specifically asked about - don't provide unrequested information
        2. Be concise and focused on their specific question
        3. If they ask about side effects, provide additional side effects beyond what's listed, but don't include dosage, interactions, etc. unless asked
        4. If they ask about dosage, focus only on dosage information
        5. Use bullet points for lists when appropriate
        6. Keep responses helpful but brief - around 3-5 sentences or a short bulleted list
        7. Always include a brief reminder to consult healthcare professionals
        8. Use your medical knowledge to enhance the answer but stay focused on the specific question
        
        Remember: Answer only what they asked, be concise, and provide focused medical information.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Google AI:', error);
      throw new Error('Failed to get response from AI assistant. Please try again.');
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
