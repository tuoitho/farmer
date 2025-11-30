import {
  DiseaseDetectionFormData,
  ChatRequest,
  ChatResponse,
} from "@/models/ai";
import { useApiPostFormData } from "../useApiPost";
import useApiPost from "../useApiPost";
import { API_ROUTE } from "@/common/config";
import useApiGet from "../useApiGet";
import useApiDelete from "../useApiDelete";

export default {
  detectDisease: async (payload: DiseaseDetectionFormData) => {
    console.log("=== AI SERVICE START ===");
    console.log("Payload type:", typeof payload);
    console.log("Payload instanceof FormData:", payload instanceof FormData);

    if (payload instanceof FormData) {
      console.log("FormData entries in service:");
      for (let [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File - ${value.name}, ${value.size} bytes, ${value.type}`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    }

    console.log("Calling API:", API_ROUTE.AI.detectDisease);

    try {
      const result = await useApiPostFormData(
        API_ROUTE.AI.detectDisease,
        payload
      );
      console.log("=== AI SERVICE SUCCESS ===");
      console.log("Result:", result);
      return result;
    } catch (error) {
      console.log("=== AI SERVICE ERROR ===");
      console.error("AI Service Error:", error);
      throw error;
    }
  },

  /**
   * Chat with the AI assistant
   * @param payload The chat request payload
   * @returns Promise with the chat response
   */
  chatWithAI: async (payload: ChatRequest): Promise<ChatResponse> => {
    console.log("=== AI CHAT SERVICE START ===");
    console.log("Chat payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await useApiPost<ChatRequest, ChatResponse>(
        API_ROUTE.AI.chatWithAI,
        payload
      );

      console.log("=== AI CHAT SERVICE SUCCESS ===");
      console.log("Chat response:", response);

      // Ensure the response matches the ChatResponse interface
      return {
        success: response?.success ?? false,
        message: response?.message || "",
        data: {
          message: response?.data?.message || "",
          success: response?.data?.success ?? false,
          error: response?.data?.error || null,
          timestamp: response?.data?.timestamp || new Date().toISOString(),
        },
        error: response?.error || null,
      };
    } catch (error) {
      console.error("=== AI CHAT SERVICE ERROR ===", error);
      // Return a proper error response
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        message: "Failed to process chat request",
        data: {
          message: "Failed to process chat request",
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
        error: errorMessage,
      };
    }
  },
 getHistoryChat: async (): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>> => {
  try {
    console.log('Fetching chat history from:', API_ROUTE.AI.getHistoryChat);
    const response = await useApiGet<{
      messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
      total_messages: number;
      last_updated: string;
    }>(API_ROUTE.AI.getHistoryChat);
    
    console.log('Chat history response:', response);
    
    return response?.data?.messages || [];
  } catch (error) {
    console.error("=== AI GET HISTORY CHAT SERVICE ERROR ===", error);
    return [];
  }
},
  deleteHistoryChat: async () => {
    try {
      const response = await useApiDelete(API_ROUTE.AI.deleteHistoryChat);
      return response;
    } catch (error) {
      console.error("=== AI DELETE HISTORY CHAT SERVICE ERROR ===", error);
      throw error;
    }
  },
  chatWithImage: async (payload: FormData): Promise<ChatResponse> => {
    console.log("=== AI CHAT WITH IMAGE SERVICE START ===");
    console.log("Chat payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await useApiPostFormData<FormData, ChatResponse>(
        API_ROUTE.AI.chatWithImage,
        payload
      );

      console.log("=== AI CHAT WITH IMAGE SERVICE SUCCESS ===");
      console.log("Chat response:", response);

      // Ensure the response matches the ChatResponse interface
      return {
        success: response?.success ?? false,
        message: response?.message || "",
        data: {
          message: response?.data?.message || "",
          success: response?.data?.success ?? false,
          error: response?.data?.error || null,
          timestamp: response?.data?.timestamp || new Date().toISOString(),
        },
        error: response?.error || null,
      };
    } catch (error) {
      console.error("=== AI CHAT WITH IMAGE SERVICE ERROR ===", error);
      // Return a proper error response
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      return {
        success: false,
        message: "Failed to process chat request",
        data: {
          message: "Failed to process chat request",
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
        error: errorMessage,
      };
    }
  },
};
