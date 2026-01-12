import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, User, Bot, Paperclip, Sparkles, FileText, Phone, Play, Pause } from 'lucide-react';
import { mockKnowledgeBase, mockCallRecords, mockContacts } from '../data/mockData';
import { format } from 'date-fns';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string, attachments?: any[]}>>(
    [
      {
        type: 'ai',
        content: 'Hello! I\'m your AI assistant. I can help you find information about contacts, suggest follow-ups, or answer questions based on your knowledge base. How can I help you today?'
      }
    ]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeCall, setActiveCall] = useState<boolean>(false);
  const [callContact, setCallContact] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState<boolean>(true);
  const [relevantKnowledge, setRelevantKnowledge] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample suggestions for the assistant
  const suggestions = [
    "Find contacts in the healthcare industry",
    "What documentation do we have about API integration?",
    "What follow-ups do I need to make today?",
    "Show me opportunities with high-value leads",
    "Help me prepare for my call with John Smith"
  ];
  
  // Start a simulated call
  const startCall = () => {
    // Randomly select a contact for the demo
    const randomContact = mockContacts[Math.floor(Math.random() * mockContacts.length)];
    setCallContact(randomContact.name);
    setActiveCall(true);
    setIsRecording(true);
    
    // Reset call duration
    setCallDuration(0);
    
    // Simulate AI providing relevant knowledge for this contact
    const contactKnowledge = mockKnowledgeBase.slice(0, 3);
    setRelevantKnowledge(contactKnowledge);
    
    // Add AI message about the call
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `📞 Call with ${randomContact.name} started. I'll analyze the conversation in real-time and provide relevant information from your knowledge base.`
    }]);
  };
  
  // End the simulated call
  const endCall = () => {
    setActiveCall(false);
    setIsRecording(false);
    
    // Add AI message with call summary
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `📝 Call with ${callContact} ended (${callDuration} seconds). I've analyzed the conversation and here are some key insights:\n\n1. Customer mentioned issues with API integration - I've highlighted relevant documentation\n\n2. Follow up with pricing information for enterprise tier\n\n3. Schedule a technical demo with the product team next week`
    }]);
    
    setCallContact(null);
  };
  
  // Simulate AI response
  const simulateResponse = (query: string) => {
    setIsTyping(true);
    
    // Simulate thinking time
    setTimeout(() => {
      let response = '';
      let attachments: Array<{ id: string; name: string; type: string }> = [];
      
      // Simple pattern matching for demo purposes
      if (query.toLowerCase().includes('contact') || query.toLowerCase().includes('find')) {
        response = "I found 5 contacts matching your criteria. Would you like me to display them or send a summary to your email?";
      } else if (query.toLowerCase().includes('follow') || query.toLowerCase().includes('today')) {
        response = "You have 3 follow-ups scheduled for today:\n\n1. Call with John Smith at Acme Inc. about enterprise solution\n2. Email follow-up with Sarah Johnson about plan upgrade\n3. Check in with Michael Chen who was interested in API integration";
      } else if (query.toLowerCase().includes('knowledge') || query.toLowerCase().includes('documentation') || query.toLowerCase().includes('api')) {
        response = "I've searched your knowledge base and found several relevant documents about API integration:";
        attachments = [
          { id: '2', name: 'API Documentation', type: 'document' },
          { id: '7', name: 'Advanced Integration Tutorial', type: 'video' }
        ];
      } else if (query.toLowerCase().includes('opportunity') || query.toLowerCase().includes('lead')) {
        response = "Based on recent interactions, your highest-value opportunity is with TechCorp. Their Marketing Director Sarah Johnson has shown interest in upgrading to our enterprise plan, which could increase their annual contract value by 35%.";
      } else if (query.toLowerCase().includes('prepare') || query.toLowerCase().includes('call with')) {
        const contactName = query.toLowerCase().includes('john') ? 'John Smith' : 
                           query.toLowerCase().includes('sarah') ? 'Sarah Johnson' : 'a customer';
        
        response = `Here's what you need to know for your call with ${contactName}:\n\n1. Last conversation: Discussed enterprise solution requirements\n\n2. Current status: Evaluating our API capabilities\n\n3. Key documents to reference: API Documentation, Product Overview\n\n4. Suggested talking points: Custom reporting features, implementation timeline, pricing for additional users`;
      } else {
        response = "I'll help you with that. Based on the information in our knowledge base, I can provide some insights. Would you like me to analyze specific data or give you a general overview?";
      }
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: response,
        attachments: attachments.length > 0 ? attachments : undefined
      }]);
      setIsTyping(false);
      
      // Update relevant knowledge based on the query
      if (query.toLowerCase().includes('api') || query.toLowerCase().includes('integration')) {
        setRelevantKnowledge(mockKnowledgeBase.filter(item => 
          item.tags.includes('api') || item.tags.includes('integration') || item.tags.includes('technical')
        ));
      } else if (query.toLowerCase().includes('pricing') || query.toLowerCase().includes('cost')) {
        setRelevantKnowledge(mockKnowledgeBase.filter(item => 
          item.tags.includes('pricing') || item.tags.includes('sales')
        ));
      }
    }, 1500);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    
    // Get AI response
    simulateResponse(input);
    
    // Clear input
    setInput('');
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Simulate call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCall]);
  
  // Format call duration
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get icon for knowledge item
  const getKnowledgeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={16} className="text-blue-500" />;
      case 'video':
        return <Play size={16} className="text-red-500" />;
      case 'link':
        return <Paperclip size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Assistant</h1>
        <p className="text-gray-600">
          Ask questions about your contacts, get insights from your knowledge base, or receive real-time assistance during customer calls.
        </p>
      </div>
      
      {/* Active Call Banner */}
      {activeCall && (
        <div className="bg-blue-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Phone size={20} className="mr-2 animate-pulse" />
            <div>
              <p className="font-medium">Active Call: {callContact}</p>
              <p className="text-sm text-blue-200">Duration: {formatCallDuration(callDuration)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className={`p-2 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-700'}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              onClick={endCall}
            >
              End Call
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-grow bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User size={20} className="text-blue-600" />
                      ) : (
                        <Brain size={20} className="text-purple-600" />
                      )}
                    </div>
                    
                    <div className={`mx-3 px-4 py-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-500 mb-2">Relevant documents:</p>
                          <div className="space-y-2">
                            {message.attachments.map((attachment, i) => (
                              <div key={i} className="flex items-center p-2 bg-white rounded-md shadow-sm">
                                {attachment.type === 'document' ? (
                                  <FileText size={16} className="text-blue-500 mr-2" />
                                ) : (
                                  <Play size={16} className="text-red-500 mr-2" />
                                )}
                                <span className="text-sm">{attachment.name}</span>
                                <button className="ml-auto text-blue-600 text-sm">View</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start max-w-3xl">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-purple-100">
                      <Brain size={20} className="text-purple-600" />
                    </div>
                    
                    <div className="mx-3 px-4 py-3 rounded-lg bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full flex items-center"
                    onClick={() => {
                      setMessages(prev => [...prev, { type: 'user', content: suggestion }]);
                      simulateResponse(suggestion);
                    }}
                  >
                    <Sparkles size={14} className="mr-1 text-blue-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSubmit} className="flex items-center">
              <button
                type="button"
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
              >
                <Paperclip size={20} />
              </button>
              
              <input
                type="text"
                className="flex-grow mx-2 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ask a question about your contacts or knowledge base..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              
              <button
                type="submit"
                className={`p-2 rounded-full ${
                  input.trim() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </form>
            
            {!activeCall && (
              <div className="mt-3 flex justify-center">
                <button 
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-full hover:bg-blue-50"
                  onClick={startCall}
                >
                  <Phone size={16} className="mr-1" />
                  Simulate Customer Call
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Knowledge Panel */}
        {showKnowledgePanel && (
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-100 h-auto lg:h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-800 flex items-center">
                <FileText size={16} className="mr-2 text-blue-500" />
                Relevant Knowledge
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowKnowledgePanel(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="p-3 overflow-y-auto flex-grow">
              {relevantKnowledge.length > 0 ? (
                <div className="space-y-3">
                  {relevantKnowledge.map((item) => (
                    <div key={item.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          {getKnowledgeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              item.type === 'document' ? 'bg-blue-100 text-blue-800' : 
                              item.type === 'video' ? 'bg-red-100 text-red-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.type}
                            </span>
                            <button className="ml-auto text-xs text-blue-600">View</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No relevant documents found</p>
                  <p className="text-xs text-gray-400 mt-1">Ask a question to see matching knowledge</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-gray-100">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">
                Browse Knowledge Base
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;