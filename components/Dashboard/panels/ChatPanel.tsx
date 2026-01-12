import React, { useState } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import SalesInboxChat from "./chat-platforms/SalesInboxChat";
import { channelConfig } from "./chat-platforms/channelConfig";

// Placeholder components for other channels
const PlaceholderChat = ({ name }: { name: string }) => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">{name} Chat Integration Coming Soon</p>
    </div>
);

type ChannelType = "salesinbox" | "whatsapp" | "messenger" | "instagram" | "tiktok";

function ChatPanel() {
  const [activeChannel, setActiveChannel] = useState<ChannelType>("salesinbox");
  const [showChannelMenu, setShowChannelMenu] = useState(false);

  const renderActiveChannelComponent = () => {
    switch(activeChannel) {
      case "salesinbox":
        return <SalesInboxChat />;
      case "whatsapp":
        return <PlaceholderChat name="WhatsApp" />;
      case "messenger":
        return <PlaceholderChat name="Messenger" />;
      case "instagram":
        return <PlaceholderChat name="Instagram" />;
      case "tiktok":
        return <PlaceholderChat name="TikTok" />;
      default:
        return <SalesInboxChat />;
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-[1400px] mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl transition-all hover:bg-orange-200">
              <MessageSquare className="w-7 h-7 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Live Chat</h2>
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all font-medium"
              onClick={() => setShowChannelMenu(!showChannelMenu)}
            >
              {channelConfig[activeChannel].icon}
              {channelConfig[activeChannel].label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            {showChannelMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                {(Object.keys(channelConfig) as ChannelType[]).map((channel) => (
                  <button
                    key={channel}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center ${
                      activeChannel === channel ? 'bg-gray-50 font-medium' : ''
                    } border-b border-gray-100 last:border-0`}
                    onClick={() => {
                      setActiveChannel(channel);
                      setShowChannelMenu(false);
                    }}
                  >
                    {channelConfig[channel].icon}
                    <span className={`ml-2 text-${channelConfig[channel].color}-600`}>
                      {channelConfig[channel].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">
              Settings
            </button>
            <button className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium">
              New Chat
            </button>
          </div>
        </div>

        {renderActiveChannelComponent()}
      </div>
    </div>
  );
}

export default ChatPanel;
