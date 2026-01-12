"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import DashboardPanel from './panels/DashboardPanel';
import CompanyProfilePanel from './panels/CompanyProfilePanel';
import LeadManagementPanel from './panels/LeadManagementPanel';
import RepMatchingPanel from './panels/RepMatchingPanel';
import SchedulerPanel from './panels/SchedulerPanel';
import CallsPanel from './panels/CallsPanel';
import EmailsPanel from './panels/EmailsPanel';
import ChatPanel from './panels/ChatPanel';
import GigsPanel from './panels/GigsPanel';
import GigDetailsPanel from './panels/GigDetailsPanel';
import QualityAssurancePanel from './panels/QualityAssurancePanel';
import OperationsPanel from './panels/OperationsPanel';
import AnalyticsPanel from './panels/AnalyticsPanel';
import IntegrationsPanel from './panels/IntegrationsPanel';
import SettingsPanel from './panels/SettingsPanel';
import { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const panelParam = searchParams?.get('panel') || 'dashboard';
  const [activePanel, setActivePanel] = useState(panelParam);

  // Render the active panel
  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard':
      case 'overview':
        return <DashboardPanel />;
      case 'company':
        return <CompanyProfilePanel />;
      case 'gigs':
        return <GigsPanel />;
      case 'gig-details':
        return <GigDetailsPanel />;
      case 'leads':
        return <LeadManagementPanel />;
      case 'rep-matching':
        return <RepMatchingPanel />;
      case 'scheduler':
        return <SchedulerPanel />;
      case 'calls':
        return <CallsPanel />;
      case 'telnyx-call-test':
        return <div>Telnyx Call Test (to be implemented)</div>;
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
      default:
        return <DashboardPanel />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'rgb(243, 244, 246)' }}>
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      <div className="flex-1 pl-64">
        <div className="p-8">
          {renderPanel()}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
