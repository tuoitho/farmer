'use server';

import { chatWithAIAction, deleteHistoryChatAction, chatWithImageAction } from '@/action/ai';
import { ChatMessage } from '@/models/ai';

export async function sendMessageToAI(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    console.log('=== SEND MESSAGE TO AI (TEXT ONLY) ===');
    console.log('Message:', message);
    console.log('History length:', conversationHistory.length);
    
    const userMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...conversationHistory, userMessage];

    const response = await chatWithAIAction({
      message,
      conversation_history: updatedHistory,
    });

    console.log('✅ Text-only AI response received');
    return response?.data?.message || 'Xin lỗi, tôi không thể xử lý yêu cầu ngay lúc này.';
  } catch (error) {
    console.error('❌ Error in sendMessageToAI:', error);
    return 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.';
  }
}

export async function sendMessageWithImageToAI(
  message: string,
  image: File,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    console.log('=== SEND MESSAGE TO AI (WITH IMAGE) ===');
    console.log('Message:', message);
    console.log('Image:', {
      name: image.name,
      size: image.size,
      type: image.type
    });
    console.log('History length:', conversationHistory.length);
    
    const formData = new FormData();
    formData.append('message', message);
    formData.append('image', image);
    formData.append('conversation_history', JSON.stringify(conversationHistory));

    console.log('📤 Calling chatWithImageAction...');
    const response = await chatWithImageAction(formData);

    console.log('✅ Image AI response received:', response?.success);
    return response?.data?.message || 'Xin lỗi, tôi không thể xử lý yêu cầu ngay lúc này.';
  } catch (error) {
    console.error('❌ Error in sendMessageWithImageToAI:', error);
    return 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.';
  }
}

export async function deleteAllChatHistory(): Promise<boolean> {
  try {
    return await deleteHistoryChatAction();
  } catch (error) {
    console.error('Error in deleteAllChatHistory:', error);
    return false;
  }
}