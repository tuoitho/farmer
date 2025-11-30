'use server';

import { DiseaseDetectionFormData, DiseaseDetectionResponse, ChatRequest, ChatResponse } from '@/models/ai';
import aiApi from '@/services/ai';

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: {
    errors?: unknown;
  };
}

export async function detectDiseaseAction(payload: DiseaseDetectionFormData): Promise<DiseaseDetectionResponse | null> {
  try {
    console.log('=== AI DETECTION ACTION START ===');
    console.log('Payload type:', typeof payload);
    console.log('Payload keys:', Object.keys(payload));
    
    // Log FormData if it's FormData
    if (payload instanceof FormData) {
      console.log('FormData entries:');
      for (const [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}, ${value.size} bytes, ${value.type}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    } else {
      console.log('Payload is not FormData:', payload);
    }

    const response = await aiApi.detectDisease(payload) as ApiResponse<DiseaseDetectionResponse> | undefined;
    console.log('=== API RESPONSE ===');
    console.log('API Response:', response);
    
    const apiResponse = response;
    console.log('Parsed Response:', apiResponse);
    
    if (apiResponse?.success) {
      console.log('Success! Returning data:', apiResponse.data);
      return apiResponse.data || null;
    } else {
      console.error('API Error:', apiResponse?.message || 'Unknown error');
      console.error('Full error response:', apiResponse);
      
      // Log validation errors specifically
      if (apiResponse?.error?.errors) {
        console.error('Validation errors:', JSON.stringify(apiResponse.error.errors, null, 2));
      }
      
      return null;
    }
  } catch (error) {
    console.error('=== AI DETECTION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Full error:', error);
    return null;
  }
  
}

export async function getHistoryChatAction(): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>> {
  try {
    console.log('=== GET CHAT HISTORY ACTION START ===');
    const messages = await aiApi.getHistoryChat();
    console.log('Chat history action response:', messages);
    
    // The response is already an array of messages from the service
    if (Array.isArray(messages) && messages.length > 0) {
      console.log(`Successfully loaded ${messages.length} chat messages`);
      return messages;
    }
    
    console.log('No chat history found');
    return [];
  } catch (error) {
    console.error('Error in getHistoryChatAction:', error);
    return [];
  }
}

export async function chatWithAIAction(payload: ChatRequest): Promise<ChatResponse | null> {
  try {
    console.log('=== AI CHAT ACTION START ===');
    console.log('Chat payload:', JSON.stringify(payload, null, 2));
    
    const response = await aiApi.chatWithAI(payload);
    console.log('=== AI CHAT RESPONSE ===');
    console.log('API Response:', response);
    
    if (response?.success) {
      console.log('Chat response successful');
      return response;
    } else {
      console.error('Chat API Error:', response?.message || 'Unknown error');
      console.error('Full error response:', response);
      
      // Return a proper error response
      return {
        success: false,
        message: response?.message || 'Failed to process chat request',
        data: {
          message: response?.data?.message || 'An error occurred while processing your request',
          success: false,
          error: response?.data?.error || 'Unknown error',
          timestamp: response?.data?.timestamp || new Date().toISOString()
        },
        error: response?.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('=== AI CHAT ACTION ERROR ===');
    console.error('Error type:', typeof error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error message:', errorMessage);
    
    // Return a proper error response
    return {
      success: false,
      message: 'Failed to process chat request',
      data: {
        message: 'An error occurred while processing your chat request',
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      error: errorMessage
    };
  }
  
}
export async function deleteHistoryChatAction(): Promise<boolean> {
  try {
    console.log('=== DELETE CHAT HISTORY ACTION START ===');
    const response = await aiApi.deleteHistoryChat();
    console.log('Delete history action response:', response);
    return true;
  } catch (error) {
    console.error('Error in deleteHistoryChatAction:', error);
    return false;
  }
}

export async function chatWithImageAction(payload: FormData): Promise<ChatResponse | null> {
  try {
    console.log('=== AI CHAT WITH IMAGE ACTION START ===');
    console.log('Payload type:', typeof payload);
    
    if (payload instanceof FormData) {
      console.log('FormData entries:');
      for (const [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}, ${value.size} bytes, ${value.type}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    }
    
    const response = await aiApi.chatWithImage(payload);
    console.log('=== AI CHAT WITH IMAGE RESPONSE ===');
    console.log('API Response:', response);
    
    if (response?.success) {
      console.log('Chat with image response successful');
      return response;
    } else {
      console.error('Chat with image API Error:', response?.message || 'Unknown error');
      console.error('Full error response:', response);
      
      return {
        success: false,
        message: response?.message || 'Failed to process chat request with image',
        data: {
          message: response?.data?.message || 'An error occurred while processing your request',
          success: false,
          error: response?.data?.error || 'Unknown error',
          timestamp: response?.data?.timestamp || new Date().toISOString()
        },
        error: response?.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('=== AI CHAT WITH IMAGE ACTION ERROR ===');
    console.error('Error type:', typeof error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error message:', errorMessage);
    
    return {
      success: false,
      message: 'Failed to process chat request with image',
      data: {
        message: 'An error occurred while processing your chat request with image',
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      error: errorMessage
    };
  }
}
