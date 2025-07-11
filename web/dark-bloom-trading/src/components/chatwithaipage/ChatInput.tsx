import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="sticky bottom-0 bg-chat-background border-t border-border p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 bg-chat-input border-border focus:ring-primary transition-smooth"
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="bg-primary hover:opacity-90 transition-smooth shadow-glow"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};