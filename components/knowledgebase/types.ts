export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  lastContact?: string;
  status?: 'active' | 'inactive' | 'lead' | 'customer';
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  companyId?: string;
}

export interface AIInsight {
  id: string;
  contactId: string;
  type: 'follow-up' | 'opportunity' | 'risk' | 'suggestion';
  content: string;
  createdAt: string;
  companyId?: string;
}

export interface KnowledgeItem {
  id: string;
  name: string;
  description?: string;
  type?: 'document' | 'video' | 'link' | 'audio' | 'guide' | 'faq';
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  tags?: string[];
  usagePercentage?: number;
  companyId?: string;
  isPublic?: boolean;
}

export interface CallRecord {
  id: string;
  contactId: string;
  date: string;
  duration: number;
  recordingUrl?: string;
  transcriptUrl?: string | null;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  tags?: string[];
  aiInsights?: string[];
  repId?: string;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  plan?: string;
  industry?: string;
  contactCount?: number;
  userCount?: number;
  createdAt?: string;
  logo?: string;
  settings?: {
    aiFeatures?: boolean;
    knowledgeBase?: boolean;
    callRecording?: boolean;
    analytics?: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager' | 'rep';
  avatar?: string;
  companyId?: string;
  department?: string;
  lastActive?: string;
}

export interface UserPermission {
  userId: string;
  companyId: string;
  permissions: {
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canManageUsers?: boolean;
  };
}

export interface LearningMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  companyId?: string;
}

export interface LearningInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  status: 'open' | 'implemented' | 'in-progress';
  createdAt: string;
  relatedDocuments: string[];
  companyId?: string;
}

export interface TrainingActivity {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  scheduledFor?: string;
  progress?: string;
  improvement?: string;
  companyId?: string;
}
