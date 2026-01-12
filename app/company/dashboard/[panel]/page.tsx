"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/app/dashboard/components/Sidebar';
import DashboardPanel from '@/app/dashboard/panels/DashboardPanel';
import CompanyProfilePanel from '@/app/dashboard/panels/CompanyProfilePanel';
import LeadManagementPanel from '@/app/dashboard/panels/LeadManagementPanel';
import RepMatchingPanel from '@/app/dashboard/panels/RepMatchingPanel';
import SchedulerPanel from '@/app/dashboard/panels/SchedulerPanel';
import CallsPanel from '@/app/dashboard/panels/CallsPanel';
import EmailsPanel from '@/app/dashboard/panels/EmailsPanel';
import ChatPanel from '@/app/dashboard/panels/ChatPanel';
import GigsPanel from '@/app/dashboard/panels/GigsPanel';
import QualityAssurancePanel from '@/app/dashboard/panels/QualityAssurancePanel';
import OperationsPanel from '@/app/dashboard/panels/OperationsPanel';
import AnalyticsPanel from '@/app/dashboard/panels/AnalyticsPanel';
import IntegrationsPanel from '@/app/dashboard/panels/IntegrationsPanel';
import SettingsPanel from '@/app/dashboard/panels/SettingsPanel';
import KnowledgeBasePanel from '@/components/Dashboard/panels/KnowledgeBasePanel';
import { Toaster } from 'react-hot-toast';

export default function CompanyDashboardPage() {
  const params = useParams();
  const routePanel = params?.panel as string || 'overview';

  // Map route segments to panel keys for sidebar highlighting
  const routeToPanelMap: { [key: string]: string } = {
    'details': 'company',
    'overview': 'overview',
    'dashboard': 'overview',
    'rep-matching': 'rep-matching',
    'live-chat': 'chat',
    'quality-assurance': 'quality-assurance',
    'telnyx-call-test': 'telnyx-call-test',
  };
  
  const panel = routeToPanelMap[routePanel] || routePanel;

  // Render the active panel
  const renderPanel = () => {
    switch (routePanel) {
      case 'overview':
      case 'dashboard':
        return <DashboardPanel />;
      case 'company':
      case 'details':
        return <CompanyProfilePanel />;
      case 'gigs':
        return <GigsPanel />;
      case 'leads':
        return <LeadManagementPanel />;
      case 'rep-matching':
      case 'matching':
        return <RepMatchingPanel />;
      case 'calls':
        return <CallsPanel />;
      case 'scheduler':
        return <SchedulerPanel />;
      case 'telnyx-call-test':
        return <div className="p-6 bg-white rounded-xl shadow-sm">Telnyx Call Test (to be implemented)</div>;
      case 'emails':
        return <EmailsPanel />;
      case 'chat':
      case 'live-chat':
        return <ChatPanel />;
      case 'quality-assurance':
        return <QualityAssurancePanel />;
      case 'operations':
        return <OperationsPanel />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'integrations':
        return <IntegrationsPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'knowledge':
      case 'knowledge-base':
        return <KnowledgeBasePanel />;
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'rgb(243, 244, 246)' }}>
      <Sidebar activePanel={panel} />
      <div className="flex-1 pl-64">
        <div className="p-8">
          {renderPanel()}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}