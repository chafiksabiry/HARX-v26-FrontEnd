import React, { useState } from 'react';
import { Building, Users, Package, Calendar, Edit, Trash2, Plus, Search, Filter, Download, Check, X } from 'lucide-react';
import { mockCompanies } from '../data/mockData';
import { Company } from '../types';
import { format, parseISO } from 'date-fns';

const CompanyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Form state for adding/editing company
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    plan: 'basic',
    settings: {
      aiFeatures: false,
      knowledgeBase: true,
      callRecording: false,
      analytics: false
    }
  });
  
  // Filter companies based on search and plan
  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesPlan = planFilter === 'all' || company.plan === planFilter;
    
    return matchesSearch && matchesPlan;
  });
  
  // Handle edit company
  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || '',
      plan: company.plan || 'basic',
      settings: {
        aiFeatures: company.settings?.aiFeatures || false,
        knowledgeBase: company.settings?.knowledgeBase ?? true,
        callRecording: company.settings?.callRecording || false,
        analytics: company.settings?.analytics || false
      }
    });
    setShowAddModal(true);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle settings toggle
  const handleSettingToggle = (setting: 'aiFeatures' | 'knowledgeBase' | 'callRecording' | 'analytics') => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: !prev.settings[setting]
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    console.log('Saving company:', editingCompany ? 'Edit' : 'New', formData);
    
    // Reset form and close modal
    setFormData({
      name: '',
      industry: '',
      plan: 'basic',
      settings: {
        aiFeatures: false,
        knowledgeBase: true,
        callRecording: false,
        analytics: false
      }
    });
    setEditingCompany(null);
    setShowAddModal(false);
  };
  
  // Get plan badge color
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Company Management</h1>
          <p className="text-gray-600">
            Manage companies, their plans, and settings in the platform.
          </p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => {
            setEditingCompany(null);
            setShowAddModal(true);
          }}
        >
          <Plus size={18} className="mr-2" />
          Add Company
        </button>
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
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="h-10 w-10 rounded-full" />
                        ) : (
                          <Building size={20} className="text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.industry || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.plan && (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(company.plan)}`}>
                        {company.plan.charAt(0).toUpperCase() + company.plan.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      {company.userCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.contactCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.createdAt && format(parseISO(company.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {company.settings?.aiFeatures && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">AI</span>
                      )}
                      {company.settings?.knowledgeBase && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">KB</span>
                      )}
                      {company.settings?.callRecording && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Calls</span>
                      )}
                      {company.settings?.analytics && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Analytics</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditCompany(company)}
                    >
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCompanies.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">No companies found matching your search criteria.</p>
          </div>
        )}
        
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredCompanies.length}</span> of <span className="font-medium">{mockCompanies.length}</span> companies
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Enter company name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="e.g. Technology, Healthcare, Finance"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={formData.plan}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">AI Features</p>
                        <p className="text-xs text-gray-500">Enable AI-powered insights and assistant</p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          formData.settings.aiFeatures ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={() => handleSettingToggle('aiFeatures')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            formData.settings.aiFeatures ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Knowledge Base</p>
                        <p className="text-xs text-gray-500">Access to knowledge base management</p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          formData.settings.knowledgeBase ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={() => handleSettingToggle('knowledgeBase')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            formData.settings.knowledgeBase ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Call Recording</p>
                        <p className="text-xs text-gray-500">Record and analyze customer calls</p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          formData.settings.callRecording ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={() => handleSettingToggle('callRecording')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            formData.settings.callRecording ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Analytics</p>
                        <p className="text-xs text-gray-500">Advanced reporting and analytics</p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          formData.settings.analytics ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={() => handleSettingToggle('analytics')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            formData.settings.analytics ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                >
                  <Check size={18} className="mr-2" />
                  {editingCompany ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;