import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Function to clean up markdown characters if we don't want to render them
const cleanMarkdown = (text: string) => {
  return text.replace(/\*/g, ''); // Remove asterisks
};

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      setIsLoading(true);
      const response = await fetch('https://n8n.srv823938.hstgr.cloud/webhook/5a1ffea2-c470-4b02-86f8-6d7e8fd4de91', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          user_question: inputMessage 
        }),
      });

      console.log("API Response Status:", response.status);
      
      if (!response.ok) {
        // Log the technical error for debugging
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error("Sorry, I'm temporarily unavailable. Please try asking your question again in a moment.");
      }

      let data;
      try {
        data = await response.json();
        console.log("API Response Data:", data);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("I apologize, but I'm having trouble understanding the response. Please try again.");
      }
      
      // Add bot response
      const botMessage: Message = {
        text: Array.isArray(data) && data[0]?.output 
          ? cleanMarkdown(data[0].output)
          : data?.response 
            ? cleanMarkdown(data?.response)
            : "I apologize, but I'm having trouble processing your request. Could you please try asking in a different way?",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Log the technical error for debugging
      console.error('Error in chat:', error);
      
      // Show user-friendly error message
      const errorMessage: Message = {
        text: error instanceof Error 
          ? error.message 
          : "I apologize, but I'm temporarily unable to respond. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 ease-in-out ai-chat-icon"
        aria-label="Open AI Chat Support"
      >
        {/* AI Chat Icon with Glow and Badge */}
        <span className="absolute -top-1 -right-1 bg-white text-orange-500 text-xs font-bold rounded-full px-2 py-0.5 shadow-md border border-orange-500 z-10" style={{letterSpacing: '1px'}}>AI</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
          fill="none"
          className="w-8 h-8"
        >
          {/* Chat bubble */}
          <ellipse cx="20" cy="22" rx="15" ry="12" fill="#fff" stroke="#fb923c" strokeWidth="2.5" />
          <path d="M12 32c0-2 2-2 4-2h8c2 0 4 0 4 2v2c0 1-1 2-2 2H14c-1 0-2-1-2-2v-2z" fill="#fb923c" opacity="0.15" />
          {/* Robot face */}
          <g>
            {/* Antenna */}
            <rect x="18.7" y="8" width="2.6" height="6" rx="1.3" fill="#fb923c" />
            <circle cx="20" cy="7" r="1.3" fill="#fb923c" />
            {/* Face outline */}
            <ellipse cx="20" cy="20" rx="7" ry="6" fill="#fff" stroke="#fb923c" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="17.5" cy="20" r="1.2" fill="#fb923c" />
            <circle cx="22.5" cy="20" r="1.2" fill="#fb923c" />
            {/* Smile */}
            <path d="M18 23c1.2 1 2.8 1 4 0" stroke="#fb923c" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>
        </svg>
        {/* Glow effect handled by CSS below */}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Chat Header */}
          <div className="bg-orange-500 p-4 rounded-t-lg">
            <h3 className="font-bold text-xl" style={{ color: '#ffffff' }}>AI Chat Support</h3>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg whitespace-pre-wrap ${
                    message.isUser
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  {message.text.split(/(\d+\.\s)/).map((part, i) => {
                    // If it's a numbered point (e.g., "1. "), add a line break before it
                    if (part.match(/^\d+\.\s$/)) {
                      return <React.Fragment key={i}>{'\n'}{part}</React.Fragment>;
                    }
                    return part;
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-gray-500">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 text-gray-900 bg-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .typing-indicator {
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: #d1d5db;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        /* AI Chat Icon Glow */
        .ai-chat-icon {
          box-shadow: 0 0 0 0 #fb923c, 0 0 16px 4px #fb923c44;
          animation: ai-glow 2s infinite alternate;
        }
        @keyframes ai-glow {
          0% {
            box-shadow: 0 0 0 0 #fb923c, 0 0 16px 4px #fb923c44;
          }
          100% {
            box-shadow: 0 0 0 4px #fb923c55, 0 0 32px 8px #fb923c66;
          }
        }
      `}</style>
    </div>
  );
} 