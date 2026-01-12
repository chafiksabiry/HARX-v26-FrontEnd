import React, { useState } from 'react';
import { Search, Brain, User, Building, Phone, Mail, Calendar, Tag } from 'lucide-react';
import { mockContacts } from '../data/mockData';
import { Contact } from '../types';
import { format, parseISO } from 'date-fns';

const AISearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Simulated AI search function
  const performAISearch = (query: string) => {
    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Simple search logic (in a real app, this would be a sophisticated AI search)
      const results = mockContacts.filter(contact => {
        const searchableText = `
          ${contact.name.toLowerCase()} 
          ${contact.email?.toLowerCase() || ''} 
          ${contact.company?.toLowerCase() || ''} 
          ${contact.position?.toLowerCase() || ''} 
          ${contact.notes?.toLowerCase() || ''} 
          ${contact.tags?.join(' ').toLowerCase() || ''}
        `;
        
        // Split query into keywords
        const keywords = query.toLowerCase().split(' ');
        
        // Check if all keywords are present
        return keywords.every(keyword => searchableText.includes(keyword));
      });
      
      setSearchResults(results);
      setIsSearching(false);
      setSearchPerformed(true);
    }, 1500);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performAISearch(searchQuery);
    }
  };
  
  // Example search suggestions
  const searchSuggestions = [
    "tech companies in San Francisco",
    "leads interested in our API",
    "contacts not reached in 30 days",
    "customers in healthcare industry",
    "marketing directors at enterprise companies"
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI-Powered Search</h1>
        <p className="text-gray-600">
          Use natural language to search your contacts. Try asking for specific industries, 
          roles, or even search within notes and conversation history.
        </p>
      </div>
      
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Brain size={20} className="text-blue-500" />
              </div>
              <input
                type="text"
                className="bg-gray-100 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3"
                placeholder="Search using natural language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
          
          {/* Search Suggestions */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    performAISearch(suggestion);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
      
      {/* Search Results */}
      {searchPerformed && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchResults.map(contact => (
                <div key={contact.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-lg">{contact.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                      {(contact.position || contact.company) && (
                        <p className="text-sm text-gray-500">
                          {contact.position && contact.company 
                            ? `${contact.position} at ${contact.company}`
                            : contact.position || contact.company}
                        </p>
                      )}
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {contact.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={16} className="mr-2 text-gray-400" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Building size={16} className="mr-2 text-gray-400" />
                            {contact.company}
                          </div>
                        )}
                        {contact.lastContact && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            Last contact: {format(parseISO(contact.lastContact), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      
                      {contact.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">{contact.notes}</p>
                        </div>
                      )}
                      
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {contact.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                            >
                              <Tag size={12} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any contacts matching your search. Try using different keywords or check for typos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearch;