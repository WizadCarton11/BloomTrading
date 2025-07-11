import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar = ({ chats, activeChat, onChatSelect, onNewChat }: ChatSidebarProps) => {
  return (
    <div className="w-80 bg-chat-sidebar border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewChat}
          className="w-full bg-primary hover:opacity-90 transition-smooth shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              onClick={() => onChatSelect(chat.id)}
              className={cn(
                "w-full p-3 h-auto justify-start text-left transition-smooth",
                "hover:bg-muted/50",
                activeChat === chat.id && "bg-muted text-primary border border-primary/20"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {chat.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(chat.createdAt).toLocaleDateString()} - {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};