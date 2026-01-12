import React, { useState } from 'react';
import { mockContacts } from '../data/mockData';
import { Contact } from '../types';
import { Search, Filter, Plus, Download, Upload } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ContactsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Contact>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter contacts based on search term and status
  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (contact.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === 'lastContact') {
      const dateA = a[sortBy] ? new Date(a[sortBy]!).getTime() : 0;
      const dateB = b[sortBy] ? new Date(b[sortBy]!).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const valueA = (a[sortBy]?.toString() || '').toLowerCase();
      const valueB = (b[sortBy]?.toString() || '').toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });
  
  const handleSort = (column: keyof Contact) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus size={18} className="mr-2" />
          Add Contact
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
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
              <Download size={18} />
            </button>
            
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
              <Upload size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortBy === 'name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center">
                    Company
                    {sortBy === 'company' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortBy === 'status' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastContact')}
                >
                  <div className="flex items-center">
                    Last Contact
                    {sortBy === 'lastContact' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{contact.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        {contact.email && (
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.company && (
                      <div className="text-sm text-gray-900">{contact.company}</div>
                    )}
                    {contact.position && (
                      <div className="text-sm text-gray-500">{contact.position}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.status && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contact.status === 'active' ? 'bg-green-100 text-green-800' : 
                        contact.status === 'lead' ? 'bg-blue-100 text-blue-800' : 
                        contact.status === 'customer' ? 'bg-purple-100 text-purple-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.lastContact && format(parseISO(contact.lastContact), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">No contacts found matching your search criteria.</p>
          </div>
        )}
        
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredContacts.length}</span> of <span className="font-medium">{mockContacts.length}</span> contacts
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
    </div>
  );
};

export default ContactsList;