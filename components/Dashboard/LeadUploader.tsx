import React, { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle, Database, CheckCircle } from "lucide-react";

interface LeadUploaderProps {
  onComplete: () => void;
  onClose: () => void;
}

export function LeadUploader({ onComplete, onClose }: LeadUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Zoho connection state for now
  const [zohoConnected, setZohoConnected] = useState(false);

  const validateFile = (file: File) => {
    const validTypes = [
        "text/csv", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        "application/vnd.ms-excel"
    ];
    // Simple extension check as fallback
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (validTypes.includes(file.type) || validExtensions.includes(extension)) {
      setFile(file);
      setError(null);
      return true;
    } else {
      setError("Please upload a CSV or Excel file");
      return false;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
        validateFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        validateFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError(null);

      // TODO: Implement actual file upload endpoint
      // const response = await fetch('/api/leads/upload', { method: 'POST', body: formData });
      
      // Simulating upload for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const checkZohoConnection = () => {
      // Mock connection logic
      alert("Zoho integration coming soon!");
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Import Leads</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {!success ? (
            <>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    
                    {file ? (
                         <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 text-green-500 mb-3" />
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-1">Drag & drop or click to browse</p>
                            <p className="text-xs text-gray-400">CSV, Excel files supported</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3 text-sm text-gray-700 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    CRM Integration
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 border bg-white rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all text-sm">
                        <span className="font-medium block">Salesforce</span>
                        <span className="text-xs text-gray-500">Coming soon</span>
                    </button>
                    <button
                        className="p-3 border bg-white rounded-lg text-left hover:border-blue-500 hover:shadow-sm transition-all text-sm"
                        onClick={checkZohoConnection}
                    >
                        <span className="font-medium block">Zoho CRM</span>
                        <span className="text-xs text-gray-500">{zohoConnected ? 'Connected' : 'Connect'}</span>
                    </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                    </div>
                )}
            </>
        ) : (
            <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Import Successful!</h3>
                <p className="text-gray-600 mt-2">Your leads are being processed.</p>
            </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {!success && (
              <>
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading ? 'Uploading...' : 'Import Leads'}
                </button>
              </>
          )}
        </div>
      </div>
    </div>
  );
}

