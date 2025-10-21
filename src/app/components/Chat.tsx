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
    <div className="position-relative">
      {/* Chat Icon - Styled to match other header buttons */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-box d-flex align-items-center justify-content-center"
        aria-label="Open AI Chat Support"
        // style={{
        //   background: '#c4b0f92b',
        //   borderRadius: '100px',
        //   width: '36px',
        //   height: '36px',
        //   border: 'none',
        //   position: 'relative'
        // }}
      >
        {/* AI Badge */}
        <span 
          className="position-absolute bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
          style={{
            top: '-2px',
            right: '-2px',
            width: '16px',
            height: '16px',
            fontSize: '8px',
            fontWeight: 'bold',
            zIndex: 10,
            border: '1px solid #007bff'
          }}
        >
          AI
        </span>
        
        {/* Chat Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 8.33333C17.5 12.0152 14.3486 15 10.4167 15H7.08333L4.16667 17.5V5.83333C4.16667 4.26449 5.43449 3 7.08333 3H13.75C15.8211 3 17.5 4.67893 17.5 6.75V8.33333Z"
            stroke="#007bff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="8.33333" cy="9.16667" r="0.833333" fill="#007bff"/>
          <circle cx="11.6667" cy="9.16667" r="0.833333" fill="#007bff"/>
          <circle cx="15" cy="9.16667" r="0.833333" fill="#007bff"/>
        </svg>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div 
          className="position-absolute bg-white rounded shadow-lg border"
          style={{
            top: '45px',
            right: '0',
            width: '320px',
            zIndex: 1050,
            maxHeight: '500px'
          }}
        >
          {/* Chat Header */}
          <div className="bg-primary text-white p-3 rounded-top d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div 
                className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px' }}
              >
                <span className="text-primary" style={{ fontSize: '10px', fontWeight: 'bold' }}>AI</span>
              </div>
              <h6 className="mb-0" style={{ fontSize: '14px' }}>AI Chat Support</h6>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="btn btn-sm text-white p-0"
              style={{ fontSize: '18px', lineHeight: '1', border: 'none', background: 'none' }}
            >
              ×
            </button>
          </div>

          {/* Messages Container */}
          <div 
            className="p-3"
            style={{ 
              height: '300px', 
              overflowY: 'auto',
              fontSize: '13px'
            }}
          >
            {messages.length === 0 && (
              <div className="text-center text-muted">
                <small>Hi! How can I help you today?</small>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${message.isUser ? 'text-end' : 'text-start'}`}
              >
                <div
                  className={`d-inline-block p-2 rounded ${
                    message.isUser
                      ? 'bg-primary text-white'
                      : 'bg-light text-dark'
                  }`}
                  style={{ 
                    maxWidth: '80%',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {message.text.split(/(\d+\.\s)/).map((part, i) => {
                    // If it's a numbered point (e.g., "1. "), add a line break before it
                    if (part.match(/^\d+\.\s$/)) {
                      return <React.Fragment key={i}>{'\n'}{part}</React.Fragment>;
                    }
                    return part;
                  })}
                </div>
                <div className="text-muted mt-1" style={{ fontSize: '10px' }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-muted">
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
          <form onSubmit={handleSendMessage} className="border-top p-2">
            <div className="d-flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="form-control form-control-sm"
                style={{ fontSize: '12px' }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-sm px-3"
                style={{ fontSize: '12px' }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .typing-indicator {
          display: flex !important;
          justify-content: center !important;
          gap: 4px !important;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background-color: #6c757d;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s !important; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s !important; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0) !important; }
          40% { transform: scale(1) !important; }
        }
      `}</style>
    </div>
  );
}