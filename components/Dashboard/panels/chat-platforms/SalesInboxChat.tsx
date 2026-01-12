import React, { useState, useEffect } from 'react';
import { Video, Share2, Users, Clock, CheckCircle2, BarChart2, PlusCircle, Send, Loader2 } from "lucide-react";
import { channelConfig } from "./channelConfig";
import api from '@/lib/rep-profile/client'; 

interface Chat {
  id: string;
  chat_id: string;
  visitor: {
    name: string;
  };
  visitor_name: string;
  last_modified_time: number;
  status: string;
  question: string;
  owner: {
    id: string;
    name: string;
    email: string;
    image_key: string;
  };
  department: {
    id: string;
    name: string;
  };
}

interface Message {
  id: string;
  time: string;
  sender: {
    name: string;
    type: string;
    id: string;
  };
  type: string;
  message: {
    text?: string;
    file?: {
      name: string;
      url: string;
      type: string;
    };
    operation_user?: any;
    chat_close_by?: string;
  };
}

const SalesInboxChat: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isZohoConnected, setIsZohoConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = {
    icon: channelConfig.salesinbox.icon,
    label: channelConfig.salesinbox.label,
    chatBg: "bg-gray-50",
    headerBg: "bg-white",
    headerText: "text-gray-800",
    messageSenderBg: "bg-blue-600",
    messageReceiverBg: "bg-white",
    messageReceiverText: "text-gray-800",
    messageSenderText: "text-white",
    messageSenderName: "text-blue-100",
    messageReceiverName: "text-blue-700 font-semibold",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    ringColor: "focus:ring-blue-500",
    nameColor: "text-blue-600",
    statsBg: "bg-blue-50",
    statsIcon: "text-blue-600",
    statsTitle: "text-blue-700",
    statsValue: "text-blue-800",
    statsSubtext: "text-blue-600",
    activeChatBg: "bg-gray-100",
    addButtonBg: "bg-blue-100 text-blue-600",
    statusColor: "text-gray-500"
  };

  const actionButtons = (
    <>
      <button className="p-2 rounded-lg hover:bg-indigo-100">
        <Video className="w-5 h-5 text-indigo-600" />
      </button>
      <button className="p-2 rounded-lg hover:bg-indigo-100">
        <Share2 className="w-5 h-5 text-indigo-600" />
      </button>
    </>
  );

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/zoho/chats');
      
      if (data.success && Array.isArray(data.data?.data)) {
        const chatData = data.data.data.map((chat: any) => ({
          id: chat.id,
          chat_id: chat.id,
          visitor: {
            name: chat.visitor?.name || 'Unknown User'
          },
          visitor_name: chat.visitor?.name || 'Unknown User',
          last_modified_time: chat.last_modified_time || Date.now(),
          status: chat.status,
          question: chat.question,
          owner: chat.owner,
          department: chat.department
        }));
        
        setChats(chatData);
        setIsZohoConnected(true);
      } else {
        setChats([]);
      }
    } catch (err: any) {
      console.error(`Error fetching chats:`, err);
      // If 404, it might mean config is missing
      if (err.response?.status === 404) {
          setIsZohoConnected(false);
      } else {
          setError("Failed to load chats. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setLoadingMessages(true);
    setActiveChat(chatId);
    try {
      const { data } = await api.get(`/zoho/chats/${chatId}/messages`);
      
      if (data.success && data.data?.data) {
        const messagesData = data.data.data.map((msg: any) => ({
          id: msg.id,
          time: msg.time,
          sender: msg.sender,
          type: msg.type,
          message: msg.message
        }));
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error(`Error fetching messages:`, err);
      setError("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!activeChat || !message.trim()) return;

    try {
      const { data } = await api.post(`/zoho/chats/${activeChat}/messages`, { text: message });

      if (data.success) {
          const newMessageObj: Message = {
            id: Date.now().toString(),
            time: Date.now().toString(),
            sender: { 
              type: "operator", 
              name: "You",
              id: "operator-1"
            },
            type: "text",
            message: { 
              text: message
            }
          };

          setMessages((prevMessages) => [...prevMessages, newMessageObj]);
          setMessage("");
      }
    } catch (err) {
      console.error(`Error sending message:`, err);
      setError("Failed to send message.");
    }
  };

  const formatDate = (timestamp: string | number) => {
    const parsedTime = Number(timestamp);
    if (isNaN(parsedTime)) return "Invalid Date";
    return new Date(parsedTime).toLocaleString();
  };

  // Helper for French short day (kept from original for consistency if desired, or switch to English)
  // Switching to English for broader compatibility or based on locale? 
  // Sticking to original logic but English names
  const getDayShort = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getMonth = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  };

  function decodeHtmlEntities(text: string) {
    // Basic decoding, in a real React app usually better to use a library or dangerouslySetInnerHTML with sanitization
    // For this simple case:
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }

  useEffect(() => {
    fetchChats();
  }, []);

  if (!isZohoConnected && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 mb-4">
          You need to connect to Zoho CRM to use the SalesInbox.
        </p>
        {/* Placeholder for configuration/connection UI or link */}
        <button 
          onClick={() => alert("Please configure Zoho in Settings > Integrations")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Configure Integration
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-700 flex items-center">
          {styles.icon}
          <span className="ml-2">{styles.label} Conversations</span>
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-all ${styles.statsBg}`}>
          <div className="flex items-center gap-3 mb-3">
            <Users className={`w-6 h-6 ${styles.statsIcon}`} />
            <span className={`font-semibold ${styles.statsTitle}`}>Active Chats</span>
          </div>
          <div className={`text-3xl font-bold ${styles.statsValue}`}>{chats.length}</div>
          <div className={`text-sm mt-1 ${styles.statsSubtext}`}>Online now</div>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-blue-700">Resolved</span>
          </div>
          <div className="text-3xl font-bold text-blue-800">--</div>
          <div className="text-sm text-blue-600 mt-1">Today</div>
        </div>
        {/* More stats... */}
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className={`col-span-1 border rounded-xl overflow-hidden ${styles.chatBg}`}>
          <div className={`p-4 border-b ${styles.headerBg} sticky top-0 flex justify-between items-center`}>
            <h3 className={`font-semibold text-lg ${styles.headerText} flex items-center`}>
              Conversations
            </h3>
            <button className={`p-1.5 rounded-full ${styles.addButtonBg}`}>
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="divide-y h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full p-4 text-left hover:bg-gray-100 flex items-center gap-4 transition-all ${
                    activeChat === chat.id ? styles.activeChatBg : ""
                  }`}
                  onClick={() => loadMessages(chat.id)}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {chat.visitor.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-lg ${styles.nameColor}`}>
                      {chat.visitor.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(chat.last_modified_time)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 p-6">
                No active conversations.
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 border rounded-xl overflow-hidden bg-white shadow-sm">
          {/* Chat Header */}
          <div className={`p-4 border-b flex items-center justify-between ${styles.headerBg}`}>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    {activeChat ? chats.find(c => c.id === activeChat)?.visitor.name[0] : "?"}
               </div>
              <div>
                <div className={`font-medium ${styles.headerText} flex items-center`}>
                  {activeChat
                    ? chats.find((chat) => chat.id === activeChat)?.visitor_name || "Unknown"
                    : "Select a conversation"}
                </div>
                <div className={`text-sm ${styles.statusColor}`}>
                  {activeChat ? "Online" : ""}
                </div>
              </div>
            </div>
            {activeChat && (
              <div className="flex gap-2">
                {actionButtons}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className={`h-[600px] p-6 overflow-y-auto ${styles.chatBg}`}>
            {loadingMessages ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : activeChat ? (
              messages.length > 0 ? (
                messages.map((msg, index) => {
                  if (!msg.message.text || !msg.message.text.trim()) return null;
                  const isOperator = msg.sender?.type === "operator" || msg.sender?.type === "bot";
                  
                  return (
                    <div key={index} className={`mb-3 flex w-full ${isOperator ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`p-4 rounded-2xl shadow max-w-[70%] break-words ${
                            isOperator
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="text-md">
                            {decodeHtmlEntities(msg.message.text)}
                          </div>
                        </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center text-gray-500 mb-4">
                    No messages in this conversation
                  </div>
                </div>
              )
            ) : (
              <div className="text-center text-gray-500 mt-32">
                Select a conversation to start chatting
              </div>
            )}
          </div>

          {/* Input Area */}
          {activeChat && (
            <div className="p-4 border-t bg-white flex items-center gap-3">
              <input
                type="text"
                className={`flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 ${styles.ringColor} focus:border-transparent`}
                placeholder={`Type your message...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
              />
              <button
                className={`px-6 py-3 text-white rounded-xl transition-all font-medium ${styles.buttonColor} flex items-center`}
                onClick={sendMessage}
              >
                <Send className="w-4 h-4 mr-2" /> Send
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SalesInboxChat;

