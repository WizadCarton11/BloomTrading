'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Bot, User, X } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AskAIModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const askAI = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      const aiMessage: Message = { role: 'ai', content: data.answer || 'No response.' };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'An error occurred while fetching the response.' },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-400/40 hover:shadow-[0_0_12px]"
      >
        <Bot className="w-5 h-5" />
        Ask AI
      </button>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-blue-500/20">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-white"
                    >
                      Ask AI
                    </Dialog.Title>
                    <button onClick={() => setIsOpen(false)}>
                      <X className="w-5 h-5 text-gray-400 hover:text-red-400 transition" />
                    </button>
                  </div>

                  {/* Chat Area */}
                  <div className="max-h-72 overflow-y-auto scrollbar space-y-4 p-2 pr-1 border border-gray-800 rounded-md bg-gray-800 mb-4">

                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'ai' && (
                          <Bot className="w-4 h-4 mt-1 text-blue-400" />
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-700 text-gray-100 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.role === 'user' && (
                          <User className="w-4 h-4 mt-1 text-white" />
                        )}
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input & Submit */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ask something about this stock..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && askAI()}
                    />
                    <button
                      onClick={askAI}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition shadow hover:shadow-blue-500/30 disabled:opacity-50"
                    >
                      {loading ? '...' : 'Ask'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
