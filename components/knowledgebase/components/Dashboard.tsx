import React from 'react';
import { Users, UserPlus, UserCheck, Clock, Brain, Zap, FileText, MessageSquare } from 'lucide-react';
import { mockContacts, mockInsights, mockLearningMetrics } from '../data/mockData';
import { format, parseISO, differenceInDays } from 'date-fns';
import Link from 'next/link';
// import jwtEncode from 'jwt-encode'; // Commented out - package not installed

const Dashboard: React.FC = () => {
  const activeContacts = mockContacts.filter(contact => contact.status === 'active').length;
  const leads = mockContacts.filter(contact => contact.status === 'lead').length;
  const customers = mockContacts.filter(contact => contact.status === 'customer').length;
  
  // Get contacts that haven't been contacted in over 14 days
  const needsFollowUp = mockContacts.filter(contact => {
    if (!contact.lastContact) return false;
    const lastContactDate = parseISO(contact.lastContact);
    return differenceInDays(new Date(), lastContactDate) > 14;
  });
  
  // Get the most recent insights
  const recentInsights = [...mockInsights].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);
  
  // Get recent contacts
  const recentContacts = [...mockContacts]
    .filter(contact => contact.lastContact) // Filter out contacts without lastContact
    .sort((a, b) => {
      const dateA = a.lastContact ? new Date(a.lastContact).getTime() : 0;
      const dateB = b.lastContact ? new Date(b.lastContact).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Function to create and store a JWT token
  // const createAndStoreJwtToken = () => {
  //   const payload = { companyId: '67d18e2b319c11009f4f2a98' };
  //   const secret = 'your-256-bit-secret'; // Use a dummy secret for encoding
  //   const token = jwtEncode(payload, secret);
  //   localStorage.setItem('jwtToken', token);
  // };

  // Generate JWT token on component mount
  // useEffect(() => {
  //   createAndStoreJwtToken();
  // }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/assistant" className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-sm text-white hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <p className="text-sm text-blue-100">Get real-time help with contacts</p>
            </div>
          </div>
        </Link>
        
        <Link href="/knowledge" className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-sm text-white hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full">
              <FileText size={24} className="text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">Knowledge Base</h3>
              <p className="text-sm text-purple-100">Manage your documentation</p>
            </div>
          </div>
        </Link>
        
        <Link href="/search" className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-sm text-white hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full">
              <Brain size={24} className="text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">AI Search</h3>
              <p className="text-sm text-green-100">Find contacts and information</p>
            </div>
          </div>
        </Link>
        
        <Link href="/augmented-learning" className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-lg shadow-sm text-white hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-full">
              <Zap size={24} className="text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-lg">AI Learning</h3>
              <p className="text-sm text-amber-100">Monitor AI improvement</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Contacts</p>
              <p className="text-2xl font-bold">{mockContacts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Leads</p>
              <p className="text-2xl font-bold">{leads}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserPlus size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Customers</p>
              <p className="text-2xl font-bold">{customers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <UserCheck size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Need Follow-up</p>
              <p className="text-2xl font-bold">{needsFollowUp.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Learning Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap size={20} className="text-amber-600" />
            <h2 className="text-lg font-semibold">AI Learning Metrics</h2>
          </div>
          <Link href="/augmented-learning" className="text-sm text-blue-600 hover:text-blue-800">View Details</Link>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockLearningMetrics.slice(0, 3).map(metric => (
              <div key={metric.id} className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{metric.name}</h3>
                  <span className={`flex items-center text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' && metric.name === 'Knowledge Gaps Identified' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                    {Math.abs(metric.change)}%
                  </span>
                </div>
                <p className="text-xl font-bold">{metric.value}{metric.name.includes('Gaps') ? '' : '%'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold">AI Insights</h2>
          </div>
          <Link href="/insights" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
        </div>
        <div className="p-4">
          {recentInsights.map(insight => (
            <div key={insight.id} className="mb-4 last:mb-0 p-3 rounded-lg bg-gray-50">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-3 ${
                  insight.type === 'follow-up' ? 'bg-blue-100' : 
                  insight.type === 'opportunity' ? 'bg-green-100' : 
                  insight.type === 'risk' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  <Brain size={16} className={`${
                    insight.type === 'follow-up' ? 'text-blue-600' : 
                    insight.type === 'opportunity' ? 'text-green-600' : 
                    insight.type === 'risk' ? 'text-red-600' : 'text-purple-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-800">{insight.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(parseISO(insight.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Contacts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Recent Contacts</h2>
          </div>
          <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{contact.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.company}</div>
                    <div className="text-sm text-gray-500">{contact.position}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;