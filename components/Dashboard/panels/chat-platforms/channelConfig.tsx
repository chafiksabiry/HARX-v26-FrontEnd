import React from "react";
import { MessageSquare, MessageCircle, Instagram, Video, Mail } from "lucide-react";

export const channelConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  salesinbox: {
    icon: <Mail className="w-5 h-5 text-blue-600" />,
    label: "SalesInbox",
    color: "blue"
  },
  whatsapp: {
    icon: <MessageCircle className="w-5 h-5 text-green-600" />,
    label: "WhatsApp",
    color: "green"
  },
  messenger: {
    icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
    label: "Messenger",
    color: "blue"
  },
  instagram: {
    icon: <Instagram className="w-5 h-5 text-pink-600" />,
    label: "Instagram",
    color: "pink"
  },
  tiktok: {
    icon: <Video className="w-5 h-5 text-black" />,
    label: "TikTok",
    color: "gray"
  }
};

