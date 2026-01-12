"use client";

import React from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Upload, manage, and share your files securely.
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h2>
              <FileUploader
                maxSize={50 * 1024 * 1024} // 50MB
                allowedTypes={[
                  'image/*',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ]}
              />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <FileList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



