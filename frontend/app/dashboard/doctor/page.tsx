import Sidebar from "../Sidebar";
import DoctorChat from "./DoctorChat";
import { getHistoryChatAction } from "@/action/ai";

// This is a Server Component by default in Next.js 13+
export default async function DoctorPage() {
  // Fetch chat history from the server
  let chatMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> = [];
  
  try {
    chatMessages = await getHistoryChatAction();
    console.log(`Loaded ${chatMessages.length} messages from server`);
  } catch (error) {
    console.error('Error fetching chat history:', error);
  }

  // Map the chat messages to the Message format expected by the UI
  const initialMessages = chatMessages.length > 0
    ? chatMessages.map((msg, index) => ({
        id: Date.now() + index, // Use timestamp-based IDs to avoid conflicts
        type: msg.role === 'assistant' ? 'ai' as const : 'user' as const,
        text: msg.content,
      }))
    : [
        {
          id: 1,
          type: "ai" as const,
          text: 'Chào bạn! Mình là AI của ứng dụng, và bạn có thể coi mình là "Bác Sĩ Riêng" cực kỳ tận tâm cho cây trồng của bạn. Cây đang có dấu hiệu lạ, úa vàng hay bị côn trùng ghé thăm ư? Đừng lo lắng! Bạn chỉ việc chụp một tấm ảnh gửi cho mình, và "tít tắc", mình sẽ chẩn đoán bệnh cùng đưa ra lời khuyên chăm sóc tốt nhất cho "bệnh nhân xanh" của bạn đó!',
        },
      ];
      
  console.log(`Initialized with ${initialMessages.length} messages`);

  const suggestedPrompts = [
    "Chụp Ảnh Cây Bệnh",
    "Cây tôi bị bệnh, nên làm gì?",
    "Ngày tưới bao nhiêu lần...",
  ];

  return (
    <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
      <Sidebar activePage="doctor" />
      <DoctorChat 
        initialMessages={initialMessages}
        suggestedPrompts={suggestedPrompts}
      />
    </div>
  );
}