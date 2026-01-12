"use client";

import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MessageSquare, Globe, Clock, User, Mic, Video,
  Send, Paperclip, Image, Smile, MoreHorizontal, List, Filter,
  PhoneIncoming, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { AIAssistant } from './AIAssistant';

interface WorkspaceProps {
  userId?: string;
  agentId?: string;
}

interface Interaction {
  id: number;
  customer: string;
  type: string;
  status: string;
  priority: string;
  waitTime: string;
  issue: string;
  channel: string;
}

export default function Workspace({ userId, agentId }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState('queue');
  const [message, setMessage] = useState('');
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    // Mock interactions for now - replace with API call
    setInteractions([
      {
        id: 1,
        customer: 'John Doe',
        type: 'Support',
        status: 'waiting',
        priority: 'high',
        waitTime: '2m',
        issue: 'Product inquiry',
        channel: 'phone'
      },
      {
        id: 2,
        customer: 'Jane Smith',
        type: 'Sales',
        status: 'active',
        priority: 'medium',
        waitTime: '0m',
        issue: 'Pricing question',
        channel: 'email'
      }
    ]);
  }, []);

  const handleStartCall = (lead: any) => {
    setSelectedLead(lead);
    setShowCallInterface(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
        <p className="text-gray-500">Manage your interactions and communications</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['queue', 'voice', 'email', 'chat'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interaction Queue</h2>
              {interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedInteraction(interaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          interaction.channel === 'phone' ? 'bg-blue-50' :
                          interaction.channel === 'email' ? 'bg-green-50' :
                          'bg-purple-50'
                        }`}>
                          {interaction.channel === 'phone' ? (
                            <Phone className="w-5 h-5 text-blue-600" />
                          ) : interaction.channel === 'email' ? (
                            <Mail className="w-5 h-5 text-green-600" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{interaction.customer}</h3>
                          <p className="text-sm text-gray-500">{interaction.issue}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          interaction.priority === 'high' ? 'bg-red-100 text-red-700' :
                          interaction.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {interaction.priority}
                        </span>
                        <span className="text-sm text-gray-500">{interaction.waitTime}</span>
                        {interaction.status === 'waiting' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartCall(interaction);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No interactions in queue
                </div>
              )}
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice Calls</h2>
              <div className="text-center py-12 text-gray-500">
                Voice call interface will be available here
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Communications</h2>
              <div className="text-center py-12 text-gray-500">
                Email interface will be available here
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Chat</h2>
              <div className="text-center py-12 text-gray-500">
                Chat interface will be available here
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        suggestions={[]} 
        onSuggestionClick={(suggestion) => console.log('Suggestion:', suggestion)} 
      />

      {/* Call Interface Modal */}
      {showCallInterface && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Call Interface</h2>
              <button
                onClick={() => {
                  setShowCallInterface(false);
                  setSelectedLead(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 text-center">
              <Phone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">Call interface will be integrated here</p>
              <button
                onClick={() => {
                  setShowCallInterface(false);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

