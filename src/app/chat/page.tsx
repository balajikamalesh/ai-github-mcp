'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const connection = sessionStorage.getItem('repoConnection');
    if (!connection) {
      router.push('/');
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Create placeholder for streaming message
    const streamingMessageId = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
      },
    ]);

    try {
      const connection = sessionStorage.getItem('repoConnection');
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-repo-connection': connection || '',
        },
        body: JSON.stringify({ message: input, history: messages }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Update the streaming message
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.streaming) {
              lastMessage.content = accumulatedText;
            }
            return newMessages;
          });
        }

        // Finalize the message
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.streaming) {
            lastMessage.streaming = false;
          }
          return newMessages;
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${err.message}`,
          timestamp: new Date(),
        };
        setMessages((prev) => {
          const newMessages = prev.filter((m) => !m.streaming);
          return [...newMessages, errorMessage];
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What is this repository about?",
    "Show me the most recent commits",
    "What files are in the src directory?",
    "Explain the main architecture",
    "What pull requests are open?",
    "What are the main dependencies?",
  ];

  return (
    <div className="h-screen bg-linear-to-br flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4 shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard">
              <button className="flex items-center text-white hover:text-purple-300 transition-colors mr-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </Link>
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Chat with AI</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-20 h-20 text-purple-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Start a Conversation</h2>
              <p className="text-gray-300 mb-8">
                Ask me anything about your repository. I can help you understand the code,
                commits, pull requests, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-left text-white transition-colors border border-white/20"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start max-w-3xl ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-purple-600 ml-3'
                          : 'bg-blue-600 mr-3'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Bot className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div
                      className={`rounded-xl p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2">{children}</p>,
                              code: ({ children }) => (
                                <code className="bg-black/30 px-1 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto my-2">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {message.content || '...'}
                          </ReactMarkdown>
                          {message.streaming && (
                            <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1"></span>
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {loading && !messages[messages.length - 1]?.streaming && (
                <div className="flex justify-start">
                  <div className="flex items-start">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-600 mr-3 flex items-center justify-center">
                      <Bot className="size-6 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="size-5 text-purple-400 animate-spin" />
                        <span className="text-white">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed */}
      <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4 shrink-0">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-end space-x-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about this repository..."
              type='text'
              className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <Send className="size-6" />
              )}
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}