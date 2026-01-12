// Mock data for AI Assistant component
import type { AIInsight, Contact, CallRecord, LearningMetric, LearningInsight, TrainingActivity, Company, User } from '../types';
import { format, subDays } from 'date-fns';

export interface KnowledgeBaseItem {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  type?: string;
  description?: string;
  lastUpdated?: string;
  tags: string[];
  aiRelevanceScore?: number;
  viewCount?: number;
  helpfulnessRating?: number;
  aiGeneratedSummary?: string;
  relatedItems?: string[];
}

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    company: 'Acme Inc.',
    position: 'CTO',
    status: 'active' as const,
    tags: ['tech', 'enterprise', 'high-priority']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@techcorp.com',
    phone: '(555) 987-6543',
    company: 'TechCorp',
    position: 'Marketing Director',
    status: 'customer' as const,
    tags: ['marketing', 'existing-customer']
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@startupinc.io',
    phone: '(555) 234-5678',
    company: 'Startup Inc.',
    position: 'Founder',
    status: 'lead' as const,
    tags: ['startup', 'api', 'new-lead']
  }
];

export const mockKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: '1',
    title: 'Customer Onboarding Best Practices',
    name: 'Customer Onboarding Best Practices',
    category: 'customer-success',
    type: 'guide',
    description: 'Step-by-step guide for successful customer onboarding.',
    lastUpdated: '2 days ago',
    tags: ['onboarding', 'best-practices', 'customer-journey']
  },
  {
    id: '2',
    title: 'API Documentation',
    name: 'API Documentation',
    category: 'product',
    type: 'document',
    description: 'Complete API integration documentation.',
    lastUpdated: '1 week ago',
    tags: ['api', 'integration', 'technical']
  },
  {
    id: '3',
    title: 'Product Demo Video Series',
    name: 'Product Demo Video Series',
    category: 'product',
    type: 'video',
    description: 'Comprehensive video tutorials covering all product features.',
    lastUpdated: '1 week ago',
    tags: ['product', 'demo', 'features', 'tutorial']
  },
  {
    id: '4',
    title: 'Pricing Guide',
    name: 'Pricing Guide',
    category: 'sales',
    type: 'document',
    description: 'Complete pricing information for all plans.',
    lastUpdated: '3 days ago',
    tags: ['pricing', 'sales', 'plans']
  },
  {
    id: '5',
    title: 'Advanced Integration Tutorial',
    name: 'Advanced Integration Tutorial',
    category: 'product',
    type: 'video',
    description: 'Advanced API integration techniques.',
    lastUpdated: '5 days ago',
    tags: ['api', 'integration', 'advanced', 'technical']
  },
  {
    id: '6',
    title: 'Sales Process Workflow',
    name: 'Sales Process Workflow',
    category: 'sales',
    type: 'guide',
    description: 'Step-by-step sales process documentation.',
    lastUpdated: '1 week ago',
    tags: ['sales', 'process', 'workflow']
  },
  {
    id: '7',
    title: 'Advanced Integration Tutorial',
    name: 'Advanced Integration Tutorial',
    category: 'product',
    type: 'video',
    description: 'Advanced integration techniques and best practices.',
    lastUpdated: '4 days ago',
    tags: ['integration', 'advanced', 'technical', 'api']
  }
];

export const mockCallRecords: CallRecord[] = [
  {
    id: '1',
    contactId: '1',
    date: new Date().toISOString().split('T')[0],
    duration: 15,
    summary: 'Discussed enterprise solution requirements.',
    sentiment: 'positive' as const,
    tags: ['enterprise', 'api', 'reporting']
  },
  {
    id: '2',
    contactId: '2',
    date: new Date().toISOString().split('T')[0],
    duration: 22,
    summary: 'Discussed upgrading their current plan.',
    sentiment: 'positive' as const,
    tags: ['upgrade', 'analytics', 'expansion']
  }
];

export const mockInsights: AIInsight[] = [
  {
    id: '1',
    contactId: '1',
    type: 'follow-up',
    content: 'John Smith hasn\'t been contacted in 7 days. Consider scheduling a follow-up call to discuss enterprise solution.',
    createdAt: new Date().toISOString().split('T')[0],
    companyId: 'comp-1'
  },
  {
    id: '2',
    contactId: '2',
    type: 'opportunity',
    content: 'Sarah Johnson\'s company is expanding their marketing department. This may be a good time to discuss our premium plan.',
    createdAt: new Date().toISOString().split('T')[0],
    companyId: 'comp-1'
  },
  {
    id: '3',
    contactId: '3',
    type: 'risk',
    content: 'Michael Chen has not responded to the last two emails. Consider a different communication approach or escalation.',
    createdAt: new Date().toISOString().split('T')[0],
    companyId: 'comp-1'
  },
  {
    id: '4',
    contactId: '2',
    type: 'suggestion',
    content: 'Based on Sarah Johnson\'s interests, consider showcasing our new analytics dashboard during the scheduled demo.',
    createdAt: new Date().toISOString().split('T')[0],
    companyId: 'comp-1'
  },
  {
    id: '5',
    contactId: '1',
    type: 'opportunity',
    content: 'John Smith was referred by an existing customer. Leverage this connection in your next interaction.',
    createdAt: new Date().toISOString().split('T')[0],
    companyId: 'comp-1'
  }
];

export const mockLearningMetrics: LearningMetric[] = [
  {
    id: '1',
    name: 'Knowledge Coverage',
    value: 78,
    change: 5.2,
    trend: 'up',
    period: '30days',
    companyId: 'comp-1'
  },
  {
    id: '2',
    name: 'Response Accuracy',
    value: 92,
    change: 3.7,
    trend: 'up',
    period: '30days',
    companyId: 'comp-1'
  },
  {
    id: '3',
    name: 'Knowledge Gaps Identified',
    value: 12,
    change: -2,
    trend: 'down',
    period: '30days',
    companyId: 'comp-1'
  },
  {
    id: '4',
    name: 'Customer Satisfaction',
    value: 87,
    change: 4.3,
    trend: 'up',
    period: '30days',
    companyId: 'comp-1'
  }
];

export const mockLearningInsights: LearningInsight[] = [
  {
    id: '1',
    title: 'API Authentication Knowledge Gap',
    description: 'Multiple customer interactions reveal confusion about OAuth implementation. Consider enhancing API documentation.',
    impact: 'high',
    status: 'open',
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    relatedDocuments: ['2', '7'],
    companyId: 'comp-1'
  },
  {
    id: '2',
    title: 'Pricing Explanation Improvement',
    description: 'AI has learned to better explain enterprise pricing tiers, resulting in 27% higher conversion rate.',
    impact: 'medium',
    status: 'implemented',
    createdAt: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    relatedDocuments: ['5'],
    companyId: 'comp-1'
  },
  {
    id: '3',
    title: 'Mobile SDK Documentation Need',
    description: 'Customers frequently asking about mobile capabilities not covered in current documentation.',
    impact: 'medium',
    status: 'in-progress',
    createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    relatedDocuments: ['1', '4'],
    companyId: 'comp-1'
  },
  {
    id: '4',
    title: 'Technical Term Clarification',
    description: 'AI has identified 12 technical terms that cause confusion during customer interactions.',
    impact: 'low',
    status: 'open',
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    relatedDocuments: ['2'],
    companyId: 'comp-1'
  },
  {
    id: '5',
    title: 'Integration Use Case Patterns',
    description: 'AI has identified common integration patterns that could be documented as templates.',
    impact: 'high',
    status: 'in-progress',
    createdAt: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    relatedDocuments: ['2', '7'],
    companyId: 'comp-1'
  }
];

export const mockTrainingActivities: TrainingActivity[] = [
  {
    id: '1',
    title: 'API Documentation Enhancement',
    description: 'Training the AI on improved API documentation with more examples and use cases.',
    status: 'completed',
    completedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    improvement: '18% accuracy increase in API-related queries',
    companyId: 'comp-1'
  },
  {
    id: '2',
    title: 'Customer Objection Handling',
    description: 'Training the AI to better handle common customer objections about pricing and features.',
    status: 'in-progress',
    startedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    progress: '68%',
    companyId: 'comp-1'
  },
  {
    id: '3',
    title: 'Technical Support Escalation',
    description: 'Teaching the AI to recognize when to escalate technical issues to the support team.',
    status: 'scheduled',
    scheduledFor: format(subDays(new Date(), -3), 'yyyy-MM-dd'),
    companyId: 'comp-1'
  },
  {
    id: '4',
    title: 'Industry-Specific Knowledge',
    description: 'Enhancing AI understanding of healthcare industry terminology and compliance requirements.',
    status: 'completed',
    completedAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    improvement: '32% better handling of healthcare client interactions',
    companyId: 'comp-1'
  },
  {
    id: '5',
    title: 'Sentiment Analysis Refinement',
    description: 'Improving AI ability to detect subtle emotional cues in customer communications.',
    status: 'in-progress',
    startedAt: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    progress: '45%',
    companyId: 'comp-1'
  }
];

export const mockCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Acme Corporation',
    plan: 'enterprise',
    industry: 'Technology',
    contactCount: 156,
    userCount: 12,
    createdAt: format(subDays(new Date(), 365), 'yyyy-MM-dd'),
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&auto=format',
    settings: {
      aiFeatures: true,
      knowledgeBase: true,
      callRecording: true,
      analytics: true
    }
  },
  {
    id: 'comp-2',
    name: 'GlobalTech Solutions',
    plan: 'professional',
    industry: 'Software',
    contactCount: 87,
    userCount: 8,
    createdAt: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&auto=format',
    settings: {
      aiFeatures: true,
      knowledgeBase: true,
      callRecording: true,
      analytics: false
    }
  },
  {
    id: 'comp-3',
    name: 'HealthPlus Medical',
    plan: 'basic',
    industry: 'Healthcare',
    contactCount: 42,
    userCount: 5,
    createdAt: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    settings: {
      aiFeatures: false,
      knowledgeBase: true,
      callRecording: false,
      analytics: false
    }
  }
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Admin',
    email: 'john.admin@example.com',
    role: 'admin',
    companyId: 'comp-1',
    department: 'Management',
    lastActive: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format'
  },
  {
    id: 'user-2',
    name: 'Sarah Manager',
    email: 'sarah.manager@example.com',
    role: 'manager',
    companyId: 'comp-1',
    department: 'Sales',
    lastActive: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&auto=format'
  },
  {
    id: 'user-3',
    name: 'Mike Rep',
    email: 'mike.rep@example.com',
    role: 'rep',
    companyId: 'comp-1',
    department: 'Sales',
    lastActive: format(subDays(new Date(), 0), 'yyyy-MM-dd'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format'
  },
  {
    id: 'user-4',
    name: 'Emily Manager',
    email: 'emily.manager@example.com',
    role: 'manager',
    companyId: 'comp-2',
    department: 'Marketing',
    lastActive: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&auto=format'
  },
  {
    id: 'user-5',
    name: 'David Rep',
    email: 'david.rep@example.com',
    role: 'rep',
    companyId: 'comp-1',
    department: 'Sales',
    lastActive: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&auto=format'
  },
  {
    id: 'user-6',
    name: 'Lisa Admin',
    email: 'lisa.admin@example.com',
    role: 'admin',
    companyId: 'comp-2',
    department: 'Management',
    lastActive: format(subDays(new Date(), 0), 'yyyy-MM-dd'),
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&auto=format'
  }
];
