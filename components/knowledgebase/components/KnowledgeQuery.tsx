import React, { useState } from 'react';
import { Search, Send, Loader2, FileText, Phone } from 'lucide-react';
import apiClient from '../api/client';
import Cookies from 'js-cookie';

interface CorpusStatus {
  exists: boolean;
  documentCount: number;
  callRecordingCount: number;
  totalCount: number;
}

interface QueryResponse {
  success: boolean;
  data?: {
    answer: string;
    metadata: {
      processedAt: string;
      model: string;
      corpusStatus: CorpusStatus;
    };
  };
  error?: {
    message: string;
    code: string;
    details?: string;
  };
}

const KnowledgeQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get userId from cookies
  const getUserId = () => {
    const runMode = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_RUN_MODE || 'in-app')
      : 'in-app';
    let userId;
    // Determine userId based on run mode
    if (runMode === 'standalone') {
      console.log("Running in standalone mode");
      // Use static userId from environment variable in standalone mode
      userId = typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_STANDALONE_USER_ID || undefined)
        : undefined;
      console.log("Using static userID from env:", userId);
    } else {
      console.log("Running in in-app mode");
      // Use userId from cookies in in-app mode
      userId = Cookies.get('userId');
      console.log("userId cookie:", userId);
      console.log("Verified saved user ID from cookie:", userId);
    }
    return userId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      const apiResponse = await apiClient.post<QueryResponse>('/analysis/ask', {
        userId,
        query
      });

      setResponse(apiResponse.data);
    } catch (error: any) {
      console.error('Error querying knowledge base:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to query knowledge base';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Knowledge Base Query</h2>
        <p className="text-gray-600">
          Ask questions about your company's knowledge base and get AI-powered answers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your knowledge base..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={18} />
                Ask
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">An error occurred</p>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {response && response.success && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Answer</h3>
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: response.data?.answer || '' }}
            />
          </div>
          {response.data?.metadata && (
            <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-b-lg">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700">Analyzed Resources:</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Documents">
                      <FileText size={14} />
                      <span>{response.data.metadata.corpusStatus.documentCount}</span>
                    </span>
                    <span className="flex items-center gap-1.5" title="Call Recordings">
                      <Phone size={14} />
                      <span>{response.data.metadata.corpusStatus.callRecordingCount}</span>
                    </span>
                  </div>
                </div>
                <p><span className="font-semibold text-gray-700">Total:</span> {response.data.metadata.corpusStatus.totalCount} resources in knowledge base</p>
                <p><span className="font-semibold text-gray-700">Model:</span> {response.data.metadata.model}</p>
                <p><span className="font-semibold text-gray-700">Processed at:</span> {new Date(response.data.metadata.processedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeQuery; 