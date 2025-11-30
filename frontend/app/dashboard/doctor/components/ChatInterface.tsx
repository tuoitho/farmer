"use client";

import { Camera, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import {
  sendMessageToAI,
  deleteAllChatHistory,
  sendMessageWithImageToAI,
} from "../action";
import { ChatMessage } from "@/models/ai";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface Message {
  id: number;
  type: "ai" | "user";
  text: string;
  imageUrl?: string;
  imageName?: string;
}

interface ChatInterfaceProps {
  initialMessages: Message[];
  suggestedPrompts: string[];
}

export default function ChatInterface({
  initialMessages: initialMessagesProp,
  suggestedPrompts: suggestedPromptsProp,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessagesProp);
  const [suggestedPrompts] = useState<string[]>(suggestedPromptsProp);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation history from loaded messages (excluding the default welcome message)
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    () => {
      // If there are messages and it's not just the default welcome message
      if (
        initialMessagesProp.length > 1 ||
        (initialMessagesProp.length === 1 && initialMessagesProp[0].id !== 1)
      ) {
        return initialMessagesProp.map((msg) => ({
          role: msg.type === "ai" ? ("assistant" as const) : ("user" as const),
          content: msg.text,
        }));
      }
      return [];
    }
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Lỗi", {
          description: "Vui lòng chọn file ảnh hợp lệ",
          duration: 3000,
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Lỗi", {
          description: "Kích thước ảnh không được vượt quá 10MB",
          duration: 3000,
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraClick = () => {
    console.log("Camera button clicked");
    console.log("File input ref:", fileInputRef.current);
    fileInputRef.current?.click();
  };

  const handleSendMessage = async () => {
    const userMessage = message.trim();

    // Validation rules
    if (selectedImage && !userMessage) {
      toast.error("Lỗi", {
        description: "Vui lòng nhập mô tả cho ảnh trước khi gửi",
        duration: 3000,
      });
      return;
    }

    if (!userMessage && !selectedImage) {
      return;
    }

    if (isLoading) return;

    console.log("=== HANDLE SEND MESSAGE ===");
    console.log("Has message:", !!userMessage);
    console.log("Has image:", !!selectedImage);
    console.log("Message text:", userMessage);
    if (selectedImage) {
      console.log("Image details:", {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
      });
    }

    // Prepare display text
    const displayText = selectedImage
      ? `${userMessage}\n[Đã gửi ảnh: ${selectedImage.name}]`
      : userMessage;

    // Create image URL for preview if image is selected
    const imageUrl = selectedImage ? URL.createObjectURL(selectedImage) : undefined;

    // Add user message to UI
    const userMessageObj = {
      id: Date.now(),
      type: "user" as const,
      text: userMessage,
      imageUrl,
      imageName: selectedImage?.name,
    };
    setMessages((prev) => [...prev, userMessageObj]);

    // Clear inputs
    const currentMessage = userMessage;
    const currentImage = selectedImage;
    setMessage("");
    handleRemoveImage();

    setIsLoading(true);

    try {
      // Update conversation history
      const chatMessage: ChatMessage = {
        role: "user",
        content: currentImage
          ? `${currentMessage} [Image: ${currentImage.name}]`
          : currentMessage,
      };
      const updatedHistory = [...conversationHistory, chatMessage];

      let aiResponse: string;

      // Call appropriate server action based on whether image is present
      if (currentImage) {
        console.log("🖼️ Calling API WITH IMAGE (text + image required)");
        aiResponse = await sendMessageWithImageToAI(
          currentMessage,
          currentImage,
          updatedHistory
        );
        console.log("✅ Got response from image API");
      } else {
        console.log("💬 Calling API TEXT ONLY");
        aiResponse = await sendMessageToAI(currentMessage, updatedHistory);
        console.log("✅ Got response from text API");
      }

      console.log("AI Response:", aiResponse);

      // Add AI response to conversation history
      const aiChatMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
      };
      setConversationHistory([...updatedHistory, aiChatMessage]);

      // Add AI message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai" as const,
          text: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai" as const,
          text: "Đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
      console.log("=== SEND MESSAGE COMPLETE ===");
    }
  };

  const resetChat = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deleteAllChatHistory();

      if (success) {
        const defaultMessage = {
          id: 1,
          type: "ai" as const,
          text: 'Chào bạn! Mình là AI của ứng dụng, và bạn có thể coi mình là "Bác Sĩ Riêng" cực kỳ tận tâm cho cây trồng của bạn. Cây đang có dấu hiệu lạ, úa vàng hay bị côn trùng ghé thăm ư? Đừng lo lắng! Bạn chỉ việc chụp một tấm ảnh gửi cho mình, và "tít tắc", mình sẽ chẩn đoán bệnh cùng đưa ra lời khuyên chăm sóc tốt nhất cho "bệnh nhân xanh" của bạn đó!',
        };

        setMessages([defaultMessage]);
        setConversationHistory([]);
        router.refresh();

        toast.success("Đã xóa lịch sử trò chuyện", {
          description: "Cuộc trò chuyện đã được đặt lại về trạng thái ban đầu",
          duration: 3000,
        });
      } else {
        toast.error("Lỗi", {
          description:
            "Không thể xóa lịch sử trò chuyện. Vui lòng thử lại sau.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting chat history:", error);
      toast.error("Lỗi", {
        description: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-screen w-full relative">
      {/* Reset Chat Button */}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={resetChat}
          disabled={isDeleting || isLoading}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Xóa lịch sử trò chuyện"
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">
            {isDeleting ? "Đang xóa..." : "Xóa lịch sử trò chuyện"}
          </span>
        </button>
      </div>

      {/* Chat Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-[20px] md:px-[40px] py-[20px] md:py-[30px] space-y-4 pb-[180px] md:pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === "ai" ? "justify-start" : "justify-end"} mb-4`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.type === "ai" ? "bg-gray-100" : "bg-green-500 text-white"
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-2 rounded-lg overflow-hidden">
                  <img
                    src={msg.imageUrl}
                    alt={msg.imageName || "Uploaded image"}
                    className="max-w-full h-auto max-h-60 object-cover rounded-lg"
                  />
                </div>
              )}
              {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#b9e2b3] rounded-[18px] rounded-tl-none p-[16px] md:p-[20px]">
              <div className="flex gap-2">
                <div
                  className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts - Only show if few messages */}
      {messages.length <= 2 && (
        <div className="px-[20px] md:px-[40px] pb-[90px] md:pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] md:gap-[16px]">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setMessage(prompt)}
                disabled={isLoading || isDeleting}
                className="bg-[#ebf5ed] box-border flex items-center justify-center px-[12px] md:px-[16px] py-[10px] md:py-[12px] rounded-[14px] hover:bg-[#d5e5d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-['Be_Vietnam_Pro'] font-medium text-[14px] leading-[20px] text-black text-center">
                  {prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="w-full px-[20px] md:px-[40px] py-3 md:py-4 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 md:static md:border-t-0 mb-16 md:mb-0 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-green-500">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
            disabled={isLoading || isDeleting}
          />

          {/* Input Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCameraClick}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
              disabled={isLoading || isDeleting}
              title="Chọn ảnh"
              type="button"
            >
              <Camera className="size-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
              placeholder={
                isLoading
                  ? "Đang xử lý..."
                  : selectedImage
                  ? "Nhập mô tả cho ảnh (bắt buộc)..."
                  : "Nhập tin nhắn..."
              }
              disabled={isLoading || isDeleting}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-[14px] md:text-[16px] disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
              disabled={
                isLoading ||
                isDeleting ||
                !message.trim() ||
                (!!selectedImage && !message.trim())
              }
              title={
                selectedImage && !message.trim()
                  ? "Vui lòng nhập mô tả cho ảnh"
                  : "Gửi tin nhắn"
              }
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
