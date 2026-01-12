"use client";

import React, { useEffect, useState } from 'react';
import { 
  Trash2, 
  Download, 
  Eye, 
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Globe,
  Lock
} from 'lucide-react';
import { files } from '../../lib/api';

interface File {
  _id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  isPublic: boolean;
  createdAt: string;
}

export default function FileList() {
  const [fileList, setFileList] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await files.getAll();
      setFileList(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await files.delete(id);
      setFileList(fileList.filter(file => file._id !== id));
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const handleDownload = async (path: string, fileName: string) => {
    try {
        // path is relative "uploads/filename". We need just filename for the route [filename]
        const filename = path.split('/').pop() || path;
        // Construct the URL to your API route
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const downloadUrl = `${apiUrl}/files/download/${filename}`;
        
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const togglePublicAccess = async (id: string, currentStatus: boolean) => {
    try {
      const updatedFile = await files.togglePublic(id);
      setFileList(fileList.map(file => 
        file._id === id ? { ...file, isPublic: updatedFile.isPublic } : file
      ));
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to update file access');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
    if (type === 'application/pdf') return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Your Files</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fileList.map((file) => (
              <tr key={file._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <span className="text-sm text-gray-900">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublicAccess(file._id, file.isPublic)}
                    className={`inline-flex items-center px-2.5 py-1.5 border rounded-full text-xs font-medium ${
                      file.isPublic
                        ? 'border-green-200 text-green-800 bg-green-50 hover:bg-green-100'
                        : 'border-gray-200 text-gray-800 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {file.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(file.path, file.name)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    {file.type.startsWith('image/') && (
                      <button
                        onClick={() => {
                            const filename = file.path.split('/').pop() || file.path;
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
                            window.open(`${apiUrl}/files/view/${filename}`, '_blank');
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Preview"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {fileList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No files uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}



