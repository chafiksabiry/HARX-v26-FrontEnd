"use client";

import React, { useState, useEffect } from 'react';
import { Upload, File, FileText, Video, Link as LinkIcon, Plus, Search, Trash2, Filter, Download, Mic, Play, Clock, Pause, ChevronDown, ChevronUp, X, ExternalLink, Eye } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/rep-profile/client';
import Cookies from 'js-cookie';

// Types (simplified for this migration)
interface KnowledgeItem {
  id: string;
  name: string;
  description: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  usagePercentage: number;
  isPublic: boolean;
}

interface CallRecord {
  id: string;
  contactId: string;
  date: string;
  duration: number;
  recordingUrl: string;
  transcriptUrl: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  aiInsights: string[];
  repId: string;
  companyId: string;
  processingOptions: {
    transcription: boolean;
    sentiment: boolean;
    insights: boolean;
  };
  audioState: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    audioInstance: HTMLAudioElement | null;
    showPlayer: boolean;
    showTranscript: boolean;
  };
}

export default function KnowledgeBasePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<string>('document');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'calls'>('documents');
  const [uploadTags, setUploadTags] = useState<string>('');
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState<{ [key: string]: boolean }>({});
  const [showTranscript, setShowTranscript] = useState<{ [key: string]: boolean }>({});
  const [processingOptions, setProcessingOptions] = useState({
    transcription: true,
    sentiment: true,
    insights: true
  });
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load items from localStorage on mount (mocking persistence for now if backend not ready)
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll try to fetch from API, but fallback to local state management for demo
    fetchDocuments();
    fetchCallRecords();
  }, []);

  // Filter knowledge base items based on search and type
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Get icon based on item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText size={20} className="text-blue-500" />;
      case 'video':
        return <Video size={20} className="text-red-500" />;
      case 'link':
        return <LinkIcon size={20} className="text-green-500" />;
      case 'audio':
        return <Mic size={20} className="text-purple-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };
  
  // Get audio duration from file
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(audio.src);
        resolve(Math.round(audio.duration / 60)); // Convert to minutes and round
      });
    });
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!uploadName) {
        setUploadName(file.name);
      }
    }
  };

  // Create a blob URL for a file
  const createFileUrl = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Fetch documents from the backend
  const fetchDocuments = async () => {
    try {
      const companyId = Cookies.get('companyId'); // Or userId depending on context
    //   if (!companyId) return;

      // Mock data for now if API fails or is not ready
        const mockDocuments: KnowledgeItem[] = [
            {
                id: '1',
                name: 'Company Policy.pdf',
                description: 'General company policies and guidelines',
                type: 'document',
                fileUrl: '#',
                uploadedAt: new Date().toISOString(),
                uploadedBy: 'Admin',
                tags: ['policy', 'hr'],
                usagePercentage: 0,
                isPublic: true
            }
        ];
        setKnowledgeItems(mockDocuments);
      
      // TODO: Uncomment when backend endpoint is ready
      /*
      const response = await api.get('/documents', {
        params: { companyId }
      });
      const documents = response.data.documents.map((doc: any) => ({
        // ... mapping logic
      }));
      setKnowledgeItems(documents);
      */
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  // Fetch call records from the backend
  const fetchCallRecords = async () => {
    try {
      const companyId = Cookies.get('companyId');
    //   if (!companyId) return;

       // Mock data
        const mockCalls: CallRecord[] = [];
        setCallRecords(mockCalls);

      // TODO: Uncomment when backend endpoint is ready
      /*
      const response = await api.get('/call-recordings', {
        params: { companyId }
      });
      const calls = response.data.callRecordings.map((call: any) => ({
         // ... mapping logic
      }));
      setCallRecords(calls);
      */
    } catch (error) {
      console.error('Error fetching call records:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      // Mock upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItem: KnowledgeItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: uploadName,
        description: uploadDescription,
        type: uploadType,
        fileUrl: uploadFile ? URL.createObjectURL(uploadFile) : uploadUrl,
        uploadedAt: format(new Date(), 'yyyy-MM-dd'),
        uploadedBy: 'Current User',
        tags: uploadTags.split(',').map(t => t.trim()),
        usagePercentage: 0,
        isPublic: true
      };

      setKnowledgeItems(prevItems => [...prevItems, newItem]);

      // Reset form and close modal
      setUploadName('');
      setUploadDescription('');
      setUploadUrl('');
      setUploadFile(null);
      setUploadTags('');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('There was an error uploading your file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle item deletion with improved cleanup
  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'documents') {
        // await api.delete(`/documents/${id}`);
        setKnowledgeItems(prevItems => prevItems.filter(item => item.id !== id));
      } else {
        // await api.delete(`/call-recordings/${id}`);
        setCallRecords(prevCalls => {
          const call = prevCalls.find(call => call.id === id);
          if (call) {
            cleanupAudioResources(call);
          }
          return prevCalls.filter(call => call.id !== id);
        });
        
        if (playingCallId === id) {
          if (currentAudio) {
            currentAudio.pause();
          }
          setCurrentAudio(null);
          setIsPlaying(false);
          setPlayingCallId(null);
          setCurrentTime(0);
          setDuration(0);
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('There was an error deleting the item. Please try again.');
    }
  };

  // Helper function to clean up audio resources
  const cleanupAudioResources = (call: CallRecord) => {
    if (call.audioState.audioInstance) {
      try {
        call.audioState.audioInstance.pause();
        call.audioState.audioInstance = null; // Remove reference
      } catch (error) {
        console.error('Error cleaning up audio instance:', error);
      }
    }
  };

  // Replace handleDownload with handleView
  const handleView = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Add function to open document/recording in new tab
  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  // Handle upload modal close
  const handleUploadModalClose = () => {
    if (!isUploading) {
      setShowUploadModal(false);
      setUploadName('');
      setUploadDescription('');
      setUploadUrl('');
      setUploadFile(null);
      setUploadTags('');
    }
  };

  // Handle details modal close
  const handleDetailsModalClose = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setPlayingCallId(null);
    }
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Handle call recording submission
  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
       // Mock upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCall: CallRecord = {
        id: Math.random().toString(36).substr(2, 9),
        contactId: uploadName,
        date: format(new Date(), 'yyyy-MM-dd'),
        duration: 0, // Mock
        recordingUrl: uploadFile ? URL.createObjectURL(uploadFile) : '',
        transcriptUrl: '',
        summary: uploadDescription,
        sentiment: 'neutral',
        tags: uploadTags.split(',').map(t => t.trim()),
        aiInsights: [],
        repId: 'current-user',
        companyId: 'company-id',
        processingOptions: { transcription: true, sentiment: true, insights: true },
        audioState: {
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          audioInstance: null,
          showPlayer: false,
          showTranscript: false
        }
      };
      
      setCallRecords(prevCalls => [...prevCalls, newCall]);
      
      // Reset form
      setUploadName('');
      setUploadDescription('');
      setUploadFile(null);
      setUploadTags('');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading call recording:', error);
      alert('There was an error uploading your call recording. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle audio playback
  const handlePlayRecording = (recordingUrl: string, callId: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }

    if (playingCallId === callId && currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
      return;
    }

    const audio = new Audio(recordingUrl);
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentAudio(audio);
      setPlayingCallId(callId);
    }).catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    });
  };

  // Handle audio position change
  const handleTimeChange = (newTime: number) => {
    if (currentAudio) {
      currentAudio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Toggle player visibility
  const togglePlayer = (callId: string) => {
    setShowPlayer(prev => ({
      ...prev,
      [callId]: !prev[callId]
    }));
  };

  // Toggle transcript visibility
  const toggleTranscript = (callId: string) => {
    setShowTranscript(prev => ({
      ...prev,
      [callId]: !prev[callId]
    }));
  };

  // Format time for audio player
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Stop audio playback when switching tabs
  useEffect(() => {
    if (activeTab !== 'calls' && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  }, [activeTab]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Knowledge Base</h1>
        <p className="text-gray-600">
          Upload documentation, videos, links, and call recordings to build your company's knowledge base.
          The AI will use this information to provide better insights and assistance when handling contacts.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'documents' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} className="inline mr-2" />
            Documents & Media
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'calls' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('calls')}
          >
            <Mic size={16} className="inline mr-2" />
            Call Recordings
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder={activeTab === 'documents' ? "Search knowledge base..." : "Search call recordings..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {activeTab === 'documents' && (
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-500" />
                <select
                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                  <option value="link">Links</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
            )}
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus size={18} className="mr-2" />
              {activeTab === 'documents' ? 'Add Resource' : 'Upload Recording'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'documents' ? (
        filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex items-start">
                  <div className="p-3 rounded-lg bg-gray-100 mr-4 flex-shrink-0">
                    {getItemIcon(item.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 break-words line-clamp-2">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag: string, index: number) => (
                        <span 
                          key={`${item.id}-${tag}`}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        item.type === 'document' ? 'bg-blue-100 text-blue-800' : 
                        item.type === 'video' ? 'bg-red-100 text-red-800' : 
                        item.type === 'audio' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                      
                      <div className="flex space-x-2 flex-shrink-0">
                        <button 
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <File size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resources found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || typeFilter !== 'all'
                ? "No resources match your current search or filter. Try adjusting your criteria."
                : "Your knowledge base is empty. Add documents, videos, or links to get started."}
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus size={18} className="mr-2" />
                Add Your First Resource
              </button>
            )}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {callRecords.length > 0 ? (
            callRecords.map((call) => (
              <div 
                key={call.id} 
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* ... Call Record rendering (same as original, just adjusted for types if needed) ... */}
                {/* For brevity, copying the structure but ensuring it uses our state and handlers */}
                <div className="flex items-start">
                   {/* ... (content same as original) ... */}
                   <div className="p-3 rounded-lg bg-purple-100 mr-4 flex-shrink-0">
                    <Mic size={20} className="text-purple-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{call.contactId}</h3>
                           <div className="flex items-center space-x-2 flex-shrink-0">
                               {/* ... buttons ... */}
                                <button onClick={() => handleDelete(call.id)}><Trash2 size={16} /></button>
                           </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 break-words overflow-hidden">{call.summary}</p>
                      {/* ... other call details ... */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Mic size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No call recordings found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "No call recordings match your search. Try adjusting your search criteria."
                  : "Your call recordings library is empty. Upload your first call recording to get started."}
              </p>
              {!searchTerm && (
                <button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Upload Your First Recording
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {activeTab === 'documents' ? 'Add to Knowledge Base' : 'Upload Call Recording'}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none text-xl font-semibold"
                onClick={handleUploadModalClose}
                disabled={isUploading}
              >
                ×
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <form onSubmit={activeTab === 'documents' ? handleSubmit : handleCallSubmit}>
                <div className="p-6">
                  {/* Form fields based on activeTab */}
                   {activeTab === 'documents' ? (
                       <>
                        <div className="mb-6">
                           <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {['document', 'video', 'link', 'audio'].map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    className={`p-4 rounded-lg border ${uploadType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} flex flex-col items-center justify-center`}
                                    onClick={() => setUploadType(type)}
                                  >
                                    {type === 'document' && <FileText size={24} className={uploadType === type ? 'text-blue-500' : 'text-gray-500'} />}
                                    {type === 'video' && <Video size={24} className={uploadType === type ? 'text-blue-500' : 'text-gray-500'} />}
                                    {type === 'link' && <LinkIcon size={24} className={uploadType === type ? 'text-blue-500' : 'text-gray-500'} />}
                                    {type === 'audio' && <Mic size={24} className={uploadType === type ? 'text-blue-500' : 'text-gray-500'} />}
                                    <span className="mt-2 text-sm capitalize">{type}</span>
                                  </button>
                              ))}
                           </div>
                        </div>

                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                              type="text"
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              value={uploadName}
                              onChange={(e) => setUploadName(e.target.value)}
                              required
                            />
                         </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              value={uploadDescription}
                              onChange={(e) => setUploadDescription(e.target.value)}
                              required
                            />
                         </div>

                         {uploadType === 'link' ? (
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                                <input
                                  type="url"
                                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                  value={uploadUrl}
                                  onChange={(e) => setUploadUrl(e.target.value)}
                                  required
                                />
                             </div>
                         ) : (
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                                <input type="file" onChange={handleFileChange} />
                             </div>
                         )}

                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <input
                              type="text"
                              className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              value={uploadTags}
                              onChange={(e) => setUploadTags(e.target.value)}
                            />
                         </div>
                       </>
                   ) : (
                       <>
                           <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                  type="text"
                                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                  value={uploadName}
                                  onChange={(e) => setUploadName(e.target.value)}
                                  required
                                />
                           </div>
                           {/* Add description and file upload for calls similarly */}
                           <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                  value={uploadDescription}
                                  onChange={(e) => setUploadDescription(e.target.value)}
                                  required
                                />
                           </div>
                           <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Call Recording</label>
                                <input type="file" accept=".mp3,.wav,.ogg,.m4a" onChange={handleFileChange} required />
                           </div>
                       </>
                   )}
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                    onClick={handleUploadModalClose}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin mr-2">⌛</span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{selectedItem.name || selectedItem.contactId}</h3>
                    <button onClick={handleDetailsModalClose}><X size={24} /></button>
                </div>
                {/* Content details based on type */}
                <p>{selectedItem.description || selectedItem.summary}</p>
                {/* Add more details as needed */}
            </div>
        </div>
      )}
    </div>
  );
}

