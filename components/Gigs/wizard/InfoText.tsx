import React from 'react';

interface InfoTextProps {
  children: React.ReactNode;
}

export function InfoText({ children }: InfoTextProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
      {children}
    </div>
  );
}
