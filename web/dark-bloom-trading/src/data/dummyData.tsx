import { Message } from "@/components/chatwithaipage/ChatMessage";
import { Chat } from "@/components/chatwithaipage/ChatSidebar";

export const dummyChats: Chat[] = [
  {
    id: "1",
    title: "Getting Started with AI",
    lastMessage: "How can I help you today?",
    timestamp: new Date(2024, 6, 10, 14, 30),
  },
  {
    id: "2", 
    title: "React Development Tips",
    lastMessage: "Here are some best practices for React...",
    timestamp: new Date(2024, 6, 9, 16, 45),
  },
  {
    id: "3",
    title: "TypeScript Questions",
    lastMessage: "TypeScript is a great way to add type safety...",
    timestamp: new Date(2024, 6, 8, 10, 20),
  },
  {
    id: "4",
    title: "UI/UX Design Discussion",
    lastMessage: "Let's talk about modern design principles...",
    timestamp: new Date(2024, 6, 7, 13, 15),
  },
  {
    id: "5",
    title: "API Integration Help",
    lastMessage: "When working with APIs, it's important to...",
    timestamp: new Date(2024, 6, 6, 11, 30),
  },
];

export const dummyMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hello! I'm excited to learn about AI and how it can help me with my projects.",
      sender: "user",
      timestamp: new Date(2024, 6, 10, 14, 25),
    },
    {
      id: "2", 
      content: "Hello! I'm here to help you explore the fascinating world of AI. Whether you're interested in machine learning, natural language processing, or practical AI applications, I can guide you through concepts, best practices, and implementation strategies. What specific area of AI would you like to start with?",
      sender: "ai",
      timestamp: new Date(2024, 6, 10, 14, 26),
    },
    {
      id: "3",
      content: "I'm particularly interested in how AI can be integrated into web applications. What are some practical ways to get started?",
      sender: "user", 
      timestamp: new Date(2024, 6, 10, 14, 28),
    },
    {
      id: "4",
      content: "Great question! There are several practical ways to integrate AI into web applications: 1) Using pre-trained APIs (like OpenAI, Google AI, or AWS AI services), 2) Implementing client-side ML with TensorFlow.js, 3) Building chatbots and virtual assistants, 4) Adding image recognition and processing features, 5) Implementing recommendation systems. Would you like me to dive deeper into any of these approaches?",
      sender: "ai",
      timestamp: new Date(2024, 6, 10, 14, 30),
    },
  ],
  "2": [
    {
      id: "5",
      content: "What are the most important React best practices I should follow?",
      sender: "user",
      timestamp: new Date(2024, 6, 9, 16, 40),
    },
    {
      id: "6",
      content: "Here are some essential React best practices: 1) Use functional components with hooks, 2) Keep components small and focused, 3) Use proper key props in lists, 4) Implement error boundaries, 5) Optimize with React.memo and useCallback when needed, 6) Follow consistent naming conventions, 7) Use TypeScript for better type safety. Each of these practices helps create maintainable and performant applications.",
      sender: "ai", 
      timestamp: new Date(2024, 6, 9, 16, 45),
    },
  ],
  "3": [
    {
      id: "7",
      content: "I'm new to TypeScript. How does it help with React development?",
      sender: "user",
      timestamp: new Date(2024, 6, 8, 10, 15),
    },
    {
      id: "8", 
      content: "TypeScript is a game-changer for React development! It provides static type checking that catches errors at compile time rather than runtime. Benefits include: better IDE support with autocomplete and refactoring, self-documenting code through type definitions, easier collaboration in teams, and reduced bugs. You can gradually adopt it by starting with .tsx files and typing your props and state.",
      sender: "ai",
      timestamp: new Date(2024, 6, 8, 10, 20),
    },
  ],
};