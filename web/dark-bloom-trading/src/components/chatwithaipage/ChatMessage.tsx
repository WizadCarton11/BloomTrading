import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const ChatMessage = ({ message }: any) => {
  const isUser = message.type === 'human';

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-message-user text-message-user-foreground' : 'bg-message-ai text-message-ai-foreground'}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div 
          className={`
            inline-block px-4 py-2 rounded-lg shadow-sm whitespace-pre-wrap
            ${isUser 
              ? 'bg-message-user text-message-user-foreground ml-auto' 
              : 'bg-message-ai text-message-ai-foreground'
            }
          `}
        >
          <ReactMarkdown
            components={{
              div: ({ node, ...props }) => (
                <div className="text-sm leading-relaxed" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <li><strong className="font-semibold ml-2" {...props} />
                </li>
              ),
              h1: ({ node, ...props }) => (
                <h1 className="text-lg font-bold " {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-base font-bold" {...props} />
              )
            }}
          >
            {message.data.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
