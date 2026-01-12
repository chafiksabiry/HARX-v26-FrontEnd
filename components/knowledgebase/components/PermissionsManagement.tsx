import React, { useState } from 'react';
import { Shield, Search, Filter, Check, X, Users, FileText, BarChart2, Brain, Settings } from 'lucide-react';
import { mockUsers, mockCompanies } from '../data/mockData';
import { User, UserPermission } from '../types';

// Role-based permissions interface
interface RolePermissions {
  canViewContacts: boolean;
  canEditContacts: boolean;
  canDeleteContacts: boolean;
  canViewKnowledge: boolean;
  canEditKnowledge: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canConfigureAI: boolean;
}

// Mock permissions data (in a real app, this would come from a database)
const mockPermissions: Record<string, RolePermissions> = {
  'admin': {
    canViewContacts: true,
    canEditContacts: true,
    canDeleteContacts: true,
    canViewKnowledge: true,
    canEditKnowledge: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canConfigureAI: true
  },
  'manager': {
    canViewContacts: true,
    canEditContacts: true,
    canDeleteContacts: false,
    canViewKnowledge: true,
    canEditKnowledge: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canConfigureAI: false
  },
  'rep': {
    canViewContacts: true,
    canEditContacts: true,
    canDeleteContacts: false,
    canViewKnowledge: true,
    canEditKnowledge: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canConfigureAI: false
  }
};

const PermissionsManagement: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions>({
    canViewContacts: false,
    canEditContacts: false,
    canDeleteContacts: false,
    canViewKnowledge: false,
    canEditKnowledge: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canConfigureAI: false
  });
  
  // Get all unique roles
  const roles = ['admin', 'manager', 'rep'];
  
  // Filter roles based on filter
  const filteredRoles = roleFilter === 'all' ? roles : roles.filter(role => role === roleFilter);
  
  // Handle edit role permissions
  const handleEditRole = (role: string) => {
    setEditingRole(role);
    setPermissions(mockPermissions[role]);
  };
  
  // Handle permission toggle
  const handlePermissionToggle = (permission: keyof RolePermissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };
  
  // Handle save permissions
  const handleSavePermissions = () => {
    if (editingRole) {
      // In a real app, this would save to a database
      console.log('Saving permissions for role:', editingRole, permissions);
      
      // Update mock permissions (for demo purposes)
      mockPermissions[editingRole] = { ...permissions };
    }
    
    setEditingRole(null);
  };
  
  // Get users count by role
  const getUsersCountByRole = (role: string) => {
    return mockUsers.filter(user => user.role === role).length;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Role Permissions</h1>
        <p className="text-gray-600">
          Manage permissions for different user roles in the system.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
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
        </div>
      </div>
      
      {/* Roles and Permissions */}
      <div className="space-y-6">
        {filteredRoles.map((role) => (
          <div key={role} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <Shield size={20} className="text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold capitalize">{role} Role</h2>
                <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {getUsersCountByRole(role)} Users
                </span>
              </div>
              
              {editingRole !== role && (
                <button 
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center"
                  onClick={() => handleEditRole(role)}
                >
                  Edit Permissions
                </button>
              )}
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${editingRole === role ? 'border border-gray-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Users size={18} className="text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium">Contact Management</h3>
                    </div>
                    
                    {editingRole === role && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">All</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canViewContacts && permissions.canEditContacts && permissions.canDeleteContacts
                              ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => {
                            const allEnabled = permissions.canViewContacts && permissions.canEditContacts && permissions.canDeleteContacts;
                            setPermissions(prev => ({
                              ...prev,
                              canViewContacts: !allEnabled,
                              canEditContacts: !allEnabled,
                              canDeleteContacts: !allEnabled
                            }));
                          }}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canViewContacts && permissions.canEditContacts && permissions.canDeleteContacts
                                ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">View Contacts</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canViewContacts ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canViewContacts')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canViewContacts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canViewContacts ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canViewContacts ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Edit Contacts</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canEditContacts ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canEditContacts')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canEditContacts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canEditContacts ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canEditContacts ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delete Contacts</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canDeleteContacts ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canDeleteContacts')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canDeleteContacts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canDeleteContacts ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canDeleteContacts ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${editingRole === role ? 'border border-gray-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText size={18} className="text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium">Knowledge Base</h3>
                    </div>
                    
                    {editingRole === role && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">All</span>
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canViewKnowledge && permissions.canEditKnowledge
                              ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => {
                            const allEnabled = permissions.canViewKnowledge && permissions.canEditKnowledge;
                            setPermissions(prev => ({
                              ...prev,
                              canViewKnowledge: !allEnabled,
                              canEditKnowledge: !allEnabled
                            }));
                          }}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canViewKnowledge && permissions.canEditKnowledge
                                ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">View Knowledge</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canViewKnowledge ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canViewKnowledge')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canViewKnowledge ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canViewKnowledge ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canViewKnowledge ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Edit Knowledge</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canEditKnowledge ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canEditKnowledge')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canEditKnowledge ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canEditKnowledge ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canEditKnowledge ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${editingRole === role ? 'border border-gray-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-3">
                    <BarChart2 size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium">Analytics & Users</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">View Analytics</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canViewAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canViewAnalytics')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canViewAnalytics ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canViewAnalytics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canViewAnalytics ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Manage Users</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canManageUsers ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canManageUsers')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canManageUsers ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canManageUsers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canManageUsers ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${editingRole === role ? 'border border-gray-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-3">
                    <Brain size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium">AI Configuration</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Configure AI</span>
                      {editingRole === role ? (
                        <button
                          type="button"
                          className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                            permissions.canConfigureAI ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          onClick={() => handlePermissionToggle('canConfigureAI')}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                              permissions.canConfigureAI ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mockPermissions[role].canConfigureAI ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mockPermissions[role].canConfigureAI ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {editingRole === role && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center"
                    onClick={() => setEditingRole(null)}
                  >
                    <X size={18} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                    onClick={handleSavePermissions}
                  >
                    <Check size={18} className="mr-2" />
                    Save Permissions
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Role Descriptions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Role Descriptions</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium mb-2">Admin</h3>
            <p className="text-sm text-gray-600">
              Administrators have full access to all features and settings within their company. They can manage users, configure AI settings, and access all analytics and reports.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium mb-2">Manager</h3>
            <p className="text-sm text-gray-600">
              Managers can view and manage contacts, access the knowledge base, and view analytics. They cannot manage users or configure AI settings unless specifically granted permission.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium mb-2">Rep</h3>
            <p className="text-sm text-gray-600">
              Sales representatives can view and manage their assigned contacts and access the knowledge base for reference. They have limited access to analytics and cannot manage users or configure system settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;