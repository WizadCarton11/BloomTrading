import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { ChatMessage, Message } from "./ChatMessage";
import { ChatMessage } from "@/components/chatwithaipage/ChatMessage";
import { ChatInput } from "@/components/chatwithaipage/ChatInput";
import { Chat, ChatSidebar } from "@/components/chatwithaipage/ChatSidebar";
import { dummyChats, dummyMessages } from "@/data/dummyData";

import { Button } from "@/components/ui/button";
import { CheckIcon, Menu } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/AppSidebar";
import { AIChatService, AuthService } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

const ChatInterface = () => {
  // const [chats] = useState<Chat[]>(dummyChats);
  const [chats, setChats] = useState<Chat[]>([]);


  const [activeChat, setActiveChat] = useState<string>("1");
  // const [messages, setMessages] =
    // useState<Record<string, Message[]>>(dummyMessages);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // const currentMessages = messages[activeChat] || [];
  const [currentMessages, setCurrentMessages] = useState<any>([]);
  const [firstQuery, setFirstQuery] = useState(true);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [currentMessages, isTyping]);
  
  const fetchUserId = async () => {
    try {
      let response = await AuthService.get('/api/auth/me')
      console.log("Response:", response.data);
      let userResponseData = response.data.data;
      setUserId(userResponseData.id);
    
       response = await AIChatService.get('/start_conversation', {
        params: {
          user_id: userResponseData.id,
        }
      })
      console.log("Response:", response.data);
       let conversationResponseData = response.data;
      setConversationId(conversationResponseData.conversation_id);
    
       response= await AIChatService.get('/get_user_conversations', {
        params: {
          user_id: userResponseData.id,
        }
      })
      console.log("Response:", response.data);
       let responseData = response.data;
      setChats(responseData.conversations);
      
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  }
  const getUserConversations= async () => {
    try {
      const response = await AIChatService.get('/get_user_conversations', {
        params: {
          user_id: userId,
        }
      });
      console.log("Response:", response.data);
      setChats(response.data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }
  useEffect(()=>{
    
    fetchUserId();
    // fetchConversationId();
    // fetchConversations();
  },[])

  const handleSendMessage = async (content: string) => {
    try {
      if (!conversationId || !userId) {
        console.error("Conversation ID or User ID is not set.");
        return;
      }
      setCurrentMessages((prev) => [
        ...prev,
        {
          message:{

            id: Date.now().toString(),
            data: { content },
            type: 'human',
            timestamp: new Date(),
          }
        },
      ])
      setIsTyping(true);
      if (firstQuery) {
        setFirstQuery(false);
        const response = await AIChatService.post('/first_query', {
          query: content,
          conversation_id: conversationId,
          user_id: userId,
        });
        console.log("Response:", response.data);
        setCurrentMessages((prev) => [
          ...prev,
          {
            message:{

              id: Date.now().toString(),
              data: { content: response.data.response.response},
              type: 'ai',
              timestamp: new Date(),
            }
          },
        ]);
        getUserConversations();
      }
      else{
        const response = await AIChatService.post('/query', {
          query: content,
          conversation_id: conversationId,
          user_id: userId,
        });
        console.log(" aiResponse:", response.data.response);
        setCurrentMessages((prev) => [
          ...prev,
          {
            message:{

              id: Date.now().toString(),
              data: { content: response.data.response},
              type: 'ai',
              timestamp: new Date(),
            }
          },
        ]);
        getUserConversations();
      }
      setIsTyping(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
    }

  };

  const handleChatSelect = async (chatId: string) => {
    try {
      setConversationId(chatId);
      if (activeChat === chatId) return; // No need to re-fetch if already active
      const response = await AIChatService.get('/get_conversation_history', {
        params: {
          conversation_id: chatId,
        }
      });
      console.log("Response:", response.data);
      setCurrentMessages(response.data.history);
      setActiveChat(chatId);
        
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  const handleNewChat =async () => {
    try {
      const response = await AIChatService.get('/start_conversation', {
          params: {
            user_id: userId,
          }
        })
      console.log("Response:", response.data);
      const newChat: Chat = {
        id: response.data.conversation_id,
        title: `Chat ${chats.length + 1}`,
        lastMessage: "",
        createdAt: new Date(),
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
      setConversationId(newChat.id);
      setCurrentMessages([]);
      setFirstQuery(true);
      setIsTyping(false);
    } catch (error) {
      console.error("Error creating new chat:", error);
      
    }
  };
  if (!conversationId){
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950">
        <AppSidebar />
        <div className="flex min-h-screen bg-background text-foreground w-full overflow-y-hidden h-screen">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-chat-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <h1 className="text-lg font-semibold">
                  {chats.find((chat) => chat.id === activeChat)?.title ||
                    "AI Chat"}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4  w-full">
              <div className="w-full h-full flex items-center justify-center">

                {currentMessages.length === 0 ? (
                  // <div className="flex items-center justify-center h-full text-center w-full">
                  //   <div className="space-y-4 w-full max-w-md">
                  //     <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                  //       <svg
                  //         className="w-8 h-8 text-white"
                  //         fill="currentColor"
                  //         viewBox="0 0 24 24"
                  //       >
                  //         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  //       </svg>
                  //     </div>
                  //     <div className="text-center w-full">
                  //       <h3 className="text-xl font-semibold mb-2 w-full">
                  //         Start a conversation
                  //       </h3>
                  //       <p className="text-muted-foreground">
                  //         Send a message to begin chatting with AI
                  //       </p>
                  //     </div>
                  //   </div>
                  // </div>
                  <EmptyState />
                ) : (
                  <div className="space-y-1 h-screen">
                    {currentMessages.map((message) => (
                      <ChatMessage key={message.message.id} message={message.message} />
                    ))}
                    {isTyping && (
                      <div className="flex gap-3 p-4">
                        <div className="w-8 h-8 bg-message-ai rounded-full flex items-center justify-center">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-message-ai-foreground rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-message-ai-foreground rounded-full animate-pulse delay-100"></div>
                            <div className="w-1 h-1 bg-message-ai-foreground rounded-full animate-pulse delay-200"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-muted-foreground">
                            AI is typing...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
          </div>

          {/* Sidebar */}
          {sidebarOpen && (
            <div
              className={`
          ${sidebarOpen ? "block" : "hidden"} 
          lg:block absolute lg:relative right-0 top-0 h-full z-10
          lg:z-auto bg-chat-sidebar lg:bg-transparent
        `}
            >
              <ChatSidebar
                chats={chats}
                activeChat={activeChat}
                onChatSelect={handleChatSelect}
                onNewChat={handleNewChat}
              />
            </div>
          )}

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-5"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};
function EmptyState() {
  return (
    <div className="text-center space-y-4 max-w-md mx-auto">
      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mx-auto">
        <CheckIcon className="text-white w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold">Start a conversation</h3>
      <p className="text-muted-foreground">
        Send a message to begin chatting with AI
      </p>
    </div>
  );
}

export default ChatInterface;
