import React, { useState } from 'react';
import { Brain, FileText, BarChart2, TrendingUp, ArrowUpRight, CheckCircle, AlertCircle, RefreshCw, Zap, BookOpen, Lightbulb, Calendar, Circle, Eye, Plus, Play } from 'lucide-react';
import { mockKnowledgeBase, mockCallRecords, mockLearningMetrics, mockLearningInsights, mockTrainingActivities } from '../data/mockData';
import { format, parseISO, subDays } from 'date-fns';

const AugmentedLearning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'training'>('overview');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  
  // Get document name by ID
  const getDocumentName = (id: string) => {
    const doc = mockKnowledgeBase.find(item => item.id === id);
    return doc ? doc.name : 'Unknown Document';
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-yellow-600 bg-yellow-100';
      case 'implemented':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'implemented':
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in-progress':
        return <RefreshCw size={16} />;
      case 'scheduled':
        return <Calendar size={16} />;
      default:
        return <Circle size={16} />;
    }
  };
  
  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Augmented Learning Management</h1>
        <p className="text-gray-600">
          Monitor and enhance how the AI learns from interactions, identify knowledge gaps, and continuously improve the system's ability to assist with contact handling.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-100">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart2 size={16} className="inline mr-2" />
            Learning Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'insights' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            <Lightbulb size={16} className="inline mr-2" />
            Learning Insights
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'training' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('training')}
          >
            <BookOpen size={16} className="inline mr-2" />
            Training Activities
          </button>
        </div>
      </div>
      
      {/* Time Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">Time Range:</div>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '7days' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange('7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '30days' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange('30days')}
            >
              Last 30 Days
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '90days' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setTimeRange('90days')}
            >
              Last 90 Days
            </button>
          </div>
        </div>
      </div>
      
      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Knowledge Growth</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{mockLearningMetrics[0].value}%</p>
                    <span className="ml-2 text-xs text-green-600 flex items-center">
                      <ArrowUpRight size={12} className="mr-0.5" />
                      +{mockLearningMetrics[0].change}% from previous
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Brain size={24} className="text-blue-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Increase in knowledge base coverage and depth
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Accuracy Improvement</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold">{mockLearningMetrics[1].value}%</p>
                    <span className="ml-2 text-xs text-green-600 flex items-center">
                      <ArrowUpRight size={12} className="mr-0.5" />
                      +{mockLearningMetrics[1].change}% from previous
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Improvement in AI response accuracy
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">New Topics Identified</p>
                  <p className="text-2xl font-bold">{mockLearningMetrics[2].value}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Lightbulb size={24} className="text-purple-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                New subject areas identified from interactions
              </p>
            </div>
          </div>
          
          {/* Success Rate Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">AI Interaction Success Rate</h2>
            <div className="flex items-center mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full" 
                  style={{ width: `${mockLearningMetrics[3].value}%` }}
                ></div>
              </div>
              <span className="ml-4 text-sm font-medium">{mockLearningMetrics[3].value}%</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <span>Successful Interactions ({mockLearningMetrics[3].value}%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span>Failed Interactions ({100 - mockLearningMetrics[3].value}%)</span>
              </div>
            </div>
          </div>
          
          {/* Knowledge Gaps */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Top Knowledge Gaps</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-start">
                  <div className="p-2 bg-yellow-100 rounded-full mr-3">
                    <AlertCircle size={16} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">OAuth Implementation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Multiple customers confused about OAuth token refresh process. Documentation needs enhancement.
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
                        High Priority
                      </span>
                      <button className="ml-auto text-xs text-blue-600">
                        Create Training Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-start">
                  <div className="p-2 bg-orange-100 rounded-full mr-3">
                    <AlertCircle size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Mobile SDK Integration</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Customers asking about mobile SDK features not covered in current documentation.
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                        Medium Priority
                      </span>
                      <button className="ml-auto text-xs text-blue-600">
                        Create Training Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <AlertCircle size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Enterprise SSO Configuration</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Enterprise customers need more detailed guidance on SSO setup with various identity providers.
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                        Low Priority
                      </span>
                      <button className="ml-auto text-xs text-blue-600">
                        Create Training Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Insights Tab Content */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {mockLearningInsights.map((insight) => (
            <div key={insight.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${getStatusColor(insight.status)}`}>
                  {getStatusIcon(insight.status)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getImpactColor(insight.impact)}`}>
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Related Documents:</h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.relatedDocuments.map((docId) => (
                        <div key={docId} className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                          <FileText size={14} className="text-blue-500 mr-1" />
                          <span>{getDocumentName(docId)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Identified on {insight.createdAt}
                    </span>
                    
                    <div className="flex space-x-3">
                      <button className={`flex items-center px-3 py-1 rounded-md ${
                        insight.status === 'open' ? 'bg-blue-600 text-white' : 'text-blue-600 border border-blue-200'
                      }`}>
                        {insight.status === 'open' ? (
                          <>
                            <Zap size={14} className="mr-1" />
                            Take Action
                          </>
                        ) : (
                          <>
                            <Eye size={14} className="mr-1" />
                            View Details
                          </>
                        )}
                      </button>
                      
                      {insight.status === 'open' && (
                        <button className="text-gray-600 border border-gray-200 px-3 py-1 rounded-md">
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Training Tab Content */}
      {activeTab === 'training' && (
        <>
          <div className="flex justify-end mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Plus size={18} className="mr-2" />
              Create Training Activity
            </button>
          </div>
          
          <div className="space-y-6">
            {mockTrainingActivities.map((activity) => (
              <div key={activity.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-4 ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{activity.description}</p>
                    
                    {activity.status === 'completed' && activity.improvement && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-green-600 mr-2" />
                          <span className="text-sm text-green-800">{activity.improvement}</span>
                        </div>
                      </div>
                    )}
                    
                    {activity.status === 'in-progress' && activity.progress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium">{activity.progress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: activity.progress }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {activity.status === 'completed' && activity.completedAt ? `Completed on ${activity.completedAt}` : 
                         activity.status === 'in-progress' && activity.startedAt ? `Started on ${activity.startedAt}` :
                         activity.status === 'scheduled' && activity.scheduledFor ? `Scheduled for ${activity.scheduledFor}` : ''}
                      </span>
                      
                      <div className="flex space-x-3">
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <Eye size={14} className="mr-1" />
                          View Details
                        </button>
                        
                        {activity.status === 'scheduled' && (
                          <button className="flex items-center text-green-600 hover:text-green-800">
                            <Play size={14} className="mr-1" />
                            Start Now
                          </button>
                        )}
                        
                        {activity.status === 'in-progress' && (
                          <button className="flex items-center text-purple-600 hover:text-purple-800">
                            <CheckCircle size={14} className="mr-1" />
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AugmentedLearning;