import React, { useState } from 'react';
import { User, UserPlus, Search, Filter, Edit, Trash2, Check, X, Building, Shield, Mail } from 'lucide-react';
import { mockUsers, mockCompanies } from '../data/mockData';
import { format, parseISO } from 'date-fns';

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form state for adding/editing user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'rep',
    companyId: '',
    department: ''
  });
  
  // Filter users based on search, role, and company
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesCompany = companyFilter === 'all' || user.companyId === companyFilter;
    
    return matchesSearch && matchesRole && matchesCompany;
  });
  
  // Handle edit user
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      department: user.department || ''
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
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    console.log('Saving user:', editingUser ? 'Edit' : 'New', formData);
    
    // Reset form and close modal
    setFormData({
      name: '',
      email: '',
      role: 'rep',
      companyId: '',
      department: ''
    });
    setEditingUser(null);
    setShowAddModal(false);
  };
  
  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown';
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'rep':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage users, their roles, and permissions across companies.
          </p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => {
            setEditingUser(null);
            setShowAddModal(true);
          }}
        >
          <UserPlus size={18} className="mr-2" />
          Add User
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="rep">Rep</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Building size={18} className="text-gray-500" />
              <select
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                <option value="all">All Companies</option>
                {mockCompanies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                        ) : (
                          <User size={20} className="text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role && (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.companyId ? getCompanyName(user.companyId) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive ? format(parseISO(user.lastActive), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditUser(user)}
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
        
        {filteredUsers.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">No users found matching your search criteria.</p>
          </div>
        )}
        
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{mockUsers.length}</span> users
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
      
      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="rep">Rep</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <select
                      id="companyId"
                      name="companyId"
                      className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a company</option>
                      {mockCompanies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department (Optional)
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="e.g. Sales, Marketing, Support"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
                
                {!editingUser && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Mail size={20} className="text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Invitation Email</p>
                        <p className="text-sm text-blue-600 mt-1">
                          An invitation email will be sent to the user with instructions to set up their password and access the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.role === 'admin' && (
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start">
                      <Shield size={20} className="text-yellow-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Admin Privileges</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Admin users have full access to manage all aspects of the company, including users, settings, and billing information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;