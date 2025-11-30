// Disease detection from AI API
export interface DiseasePrediction {
  disease: string;
  confidence: number;
}

export interface Detection {
  disease_name: string;
  confidence: number;
  top_predictions: DiseasePrediction[];
}

export interface AiAdvice {
  disease_name: string;
  advice: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  treatment: string[];
  notes: string[];
}

export interface DiseaseDetectionResponse {
  detection: Detection;
  ai_advice: string;
}

// For form data when uploading image
export interface DiseaseDetectionRequest {
  image: File;
  farm_id?: string;
  crop_type?: string;
  additional_context?: string;
}

// Chat message interface
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Chat request interface
export interface ChatRequest {
  message: string;
  conversation_history: ChatMessage[];
}

// Chat response interface
export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    success: boolean;
    error: string | null;
    timestamp: string;
  };
  error: string | null;
}
// Single chat history message
export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Chat history response from API
export interface ChatHistoryResponse {
  success: boolean;
  message: string;
  data: {
    messages: ChatHistoryMessage[];
    total_messages: number;
    last_updated: string;
  };
  error: string | null;
}

// Accept FormData for server action
export type DiseaseDetectionFormData = FormData;
