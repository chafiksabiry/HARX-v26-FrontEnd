import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { callsApi, Call } from '@/lib/dashboard/services/callsClient';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneCall,
  MessageCircle,
  Info,
  X
} from 'lucide-react';
import { CallInterface } from '../CallInterface';
import { useAuth } from '@/lib/dashboard/hooks/useAuth';
import { GlobalAIAssistant, AIAssistantAPI } from '../GlobalAIAssistant';

interface ActiveCall {
  number: string;
  agentId: string;
  callId: string;
}

const CallsPanel = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [allCalls, setCalls] = useState<Call[]>([]);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProvider, setSelectedProvider] = useState<'twilio' | 'qalqul'>('twilio');
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only show panel if window exists (client-side)
    if (typeof window !== 'undefined') {
        AIAssistantAPI.showPanel();
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        AIAssistantAPI.hidePanel();
      }
    };
  }, []);

  const handleCall = (phoneNumber: string) => {
    const phoneRegex = /^(\+|00)([1-9]{1})\d{1,14}$/;
    if (phoneRegex.test(phoneNumber)) {
      if (!currentUser) {
        setError('You must be logged in to make calls');
        return;
      }
      setActiveCall({
        number: phoneNumber,
        agentId: currentUser.userId || currentUser._id,
        callId: `call_${Date.now()}`
      });
      setShowPhoneInput(false);
      setError('');
    } else {
      setError('Please enter a valid international phone number (e.g. +13024440090 or 0013024440090)');
    }
  };

  const fetchCalls = async () => {
    try {
      if (!currentUser) return;
      
      const userId = currentUser.userId || currentUser._id;
      const data = await callsApi.getAll({ userId });
      
      if (data && Array.isArray(data.data)) {
         setCalls(data.data);
      } else if (Array.isArray(data)) {
          setCalls(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setError('Failed to fetch calls');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchCalls();
    }
  }, [currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please log in to access calls.</p>
      </div>
    );
  }

  const filteredCalls = allCalls.filter(call => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'incoming') return call.direction === 'inbound';
      if (activeFilter === 'outgoing') return call.direction === 'outbound' || call.direction === 'outbound-dial';
      if (activeFilter === 'missed') return call.status === 'missed';
      return true;
  });

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Calls Dashboard</h2>
            </div>
            {!showPhoneInput ? (
              <button
                onClick={() => setShowPhoneInput(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Call
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => handleCall(phoneNumber)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Call
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}


          <div className="flex items-center gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              onClick={() => setActiveFilter('all')}
            >
              All Calls
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'incoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              onClick={() => setActiveFilter('incoming')}
            >
              Incoming
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'outgoing'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              onClick={() => setActiveFilter('outgoing')}
            >
              Outgoing
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${activeFilter === 'missed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              onClick={() => setActiveFilter('missed')}
            >
              Missed
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCalls.map((call, index) => (
                  <tr key={call._id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {call.direction === "inbound" ? (
                          <PhoneIncoming className="w-5 h-5 text-green-600" />
                        ) : (
                          <PhoneOutgoing className="w-5 h-5 text-blue-600" />
                        )}
                        <span>{call.direction.charAt(0).toUpperCase() + call.direction.slice(1)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{(call.lead) ? call.lead.name : "Unknown"}</div>
                          <div className="text-sm text-gray-500">{(call.lead) ? call.lead.phone : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{new Date(call.createdAt).toLocaleString()}</td>
                    <td className="py-3">{call.duration} sec</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${call.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : call.status === "missed"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {call.status ? call.status.charAt(0).toUpperCase() + call.status.slice(1) : ''}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          onClick={() => handleCall(call.lead?.phone || "")}
                        >
                          <PhoneCall className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          onClick={() => router.push(`/dashboard/calls/${call._id}`)}
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <GlobalAIAssistant />

      {activeCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setActiveCall(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <CallInterface
              phoneNumber={activeCall.number}
              agentId={activeCall.agentId}
              onEnd={() => {
                setActiveCall(null);
              }}
              onCallSaved={fetchCalls}
              provider={selectedProvider}
              callId={activeCall.callId}
            />
          </div>
        </div>
      )}

      {showPhoneInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Call Provider
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedProvider('twilio')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedProvider === 'twilio'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Twilio
                </button>
                <button
                  onClick={() => setSelectedProvider('qalqul')}
                  disabled
                  className={`px-4 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed`}
                  title="Not supported yet"
                >
                  Qalqul
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="px-4 py-2 border border-gray-300 rounded-lg flex-1"
              />
              <button
                onClick={() => handleCall(phoneNumber)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Call
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CallsPanel;

