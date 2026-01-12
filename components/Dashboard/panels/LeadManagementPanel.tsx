import React, { useEffect, useState } from 'react';
import { useLeads, Lead } from '@/lib/dashboard/hooks/useLeads';
import { LeadUploader } from '../LeadUploader';
import { 
    Search, 
    Filter, 
    Plus, 
    MoreVertical, 
    Mail, 
    Phone, 
    User,
    BrainCircuit,
    Loader2
} from 'lucide-react';
import { Dialog } from '@headlessui/react';

const LeadManagementPanel = () => {
  const { leads, loading, error, fetchLeads, analyzeLead } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAnalyze = async (leadId: string) => {
      setAnalyzingId(leadId);
      await analyzeLead(leadId);
      setAnalyzingId(null);
  };

  const filteredLeads = leads.filter(lead => 
    (lead.Deal_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     lead.Email_1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     lead.Phone?.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Lead Management</h2>
            <p className="text-gray-500 text-sm mt-1">Track and manage your sales pipeline</p>
        </div>
        <button 
            onClick={() => setShowUploader(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Import Leads
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search leads by name, email, phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && leads.length === 0 ? (
            <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        ) : error ? (
            <div className="p-8 text-center text-red-500">
                Error loading leads: {error}
            </div>
        ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                No leads found. Import some leads to get started.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name / Deal</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact Info</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">AI Score</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredLeads.map((lead) => (
                            <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                            {lead.Deal_Name?.[0] || <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{lead.Deal_Name || 'Unknown Lead'}</div>
                                            <div className="text-xs text-gray-500">{lead.company || 'No Company'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {lead.Email_1 && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-3 h-3" />
                                                {lead.Email_1}
                                            </div>
                                        )}
                                        {lead.Phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3 h-3" />
                                                {lead.Phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${lead.Stage === 'Closed Won' ? 'bg-green-100 text-green-800' : 
                                          lead.Stage === 'Lost' ? 'bg-red-100 text-red-800' : 
                                          'bg-blue-100 text-blue-800'}`}>
                                        {lead.Stage || lead.status || 'New'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {lead.metadata?.ai_analysis ? (
                                        <div className="flex items-center gap-2">
                                            <div className={`text-sm font-bold ${
                                                (lead.metadata.ai_analysis.score || 0) > 70 ? 'text-green-600' : 'text-amber-600'
                                            }`}>
                                                {lead.metadata.ai_analysis.score}/100
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {lead.metadata.ai_analysis.sentiment}
                                            </span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleAnalyze(lead._id)}
                                            disabled={analyzingId === lead._id}
                                            className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200 hover:bg-purple-100 flex items-center gap-1"
                                        >
                                            {analyzingId === lead._id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <BrainCircuit className="w-3 h-3" />
                                            )}
                                            Analyze
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Uploader Dialog */}
      <Dialog 
        open={showUploader} 
        onClose={() => setShowUploader(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel>
                <LeadUploader 
                    onComplete={() => {
                        fetchLeads(); // Refresh list
                        setShowUploader(false);
                    }} 
                    onClose={() => setShowUploader(false)} 
                />
            </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default LeadManagementPanel;

