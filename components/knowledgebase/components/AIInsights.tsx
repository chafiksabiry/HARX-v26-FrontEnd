import React, { useState } from 'react';
import { mockInsights, mockContacts } from '../data/mockData';
import { AIInsight } from '../types';
import { Brain, AlertTriangle, Clock, Lightbulb, TrendingUp, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AIInsights: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  
  // Filter insights based on type
  const filteredInsights = filterType === 'all' 
    ? mockInsights 
    : mockInsights.filter(insight => insight.type === filterType);
  
  // Get contact name by ID
  const getContactName = (contactId: string) => {
    const contact = mockContacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };
  
  // Get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'follow-up':
        return <Clock size={20} className="text-blue-500" />;
      case 'opportunity':
        return <TrendingUp size={20} className="text-green-500" />;
      case 'risk':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'suggestion':
        return <Lightbulb size={20} className="text-purple-500" />;
      default:
        return <Brain size={20} className="text-gray-500" />;
    }
  };
  
  // Get background color based on insight type
  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'follow-up':
        return 'bg-blue-50';
      case 'opportunity':
        return 'bg-green-50';
      case 'risk':
        return 'bg-red-50';
      case 'suggestion':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Insights</h1>
        <p className="text-gray-600">
          AI-generated insights to help you manage your contacts more effectively.
          These insights are automatically generated based on contact data and interaction history.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center">
          <Filter size={18} className="text-gray-500 mr-2" />
          <span className="text-sm text-gray-700 mr-4">Filter by type:</span>
          
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm ${
                filterType === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                filterType === 'follow-up' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              onClick={() => setFilterType('follow-up')}
            >
              <Clock size={14} className="mr-1" />
              Follow-ups
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                filterType === 'opportunity' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
              onClick={() => setFilterType('opportunity')}
            >
              <TrendingUp size={14} className="mr-1" />
              Opportunities
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                filterType === 'risk' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
              onClick={() => setFilterType('risk')}
            >
              <AlertTriangle size={14} className="mr-1" />
              Risks
            </button>
            
            <button
              className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                filterType === 'suggestion' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
              onClick={() => setFilterType('suggestion')}
            >
              <Lightbulb size={14} className="mr-1" />
              Suggestions
            </button>
          </div>
        </div>
      </div>
      
      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => (
            <div 
              key={insight.id} 
              className={`p-4 rounded-lg shadow-sm border border-gray-100 ${getInsightBgColor(insight.type)}`}
            >
              <div className="flex items-start">
                <div className="mr-4">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 mr-2">
                      {getContactName(insight.contactId)}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      insight.type === 'follow-up' ? 'bg-blue-100 text-blue-800' : 
                      insight.type === 'opportunity' ? 'bg-green-100 text-green-800' : 
                      insight.type === 'risk' ? 'bg-red-100 text-red-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {insight.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-700">{insight.content}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Generated on {format(parseISO(insight.createdAt), 'MMM d, yyyy')}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        Take Action
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-800">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Brain size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No insights found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no insights matching your current filter. Try selecting a different filter or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;