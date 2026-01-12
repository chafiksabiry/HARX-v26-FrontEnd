import React from 'react';

const SettingsPanel = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Account Preferences</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Notifications</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive emails about new gigs and messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Security</h4>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

