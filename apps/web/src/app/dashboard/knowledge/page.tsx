'use client';

import React, { useState } from 'react';
import { Upload, FileText, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function KnowledgeBasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<{ id: string, name: string, status: string }[]>([]);
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${API_BASE_URL}/knowledge/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document');
      }

      toast.success('Document uploaded and processed successfully!');
      setUploadedDocs(prev => [...prev, result.data]);
      setFile(null);
      // Reset input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50 flex items-center gap-3">
          <Database className="h-8 w-8 text-indigo-500" />
          Knowledge Base
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">
          Upload documents to build your organization's internal knowledge base for agents to use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-6">Upload Document</h2>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-colors bg-zinc-950/50">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="text-zinc-300 font-medium mb-1">Click to browse or drag and drop</p>
                <p className="text-zinc-500 text-sm">PDF or TXT up to 10MB</p>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-5 w-5 text-zinc-400 shrink-0" />
                  <span className="text-sm text-zinc-200 truncate">{file.name}</span>
                </div>
                <span className="text-xs text-zinc-500 shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Embeddings...
                </>
              ) : (
                'Upload and Process'
              )}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-6">Uploaded Documents</h2>
          
          <div className="space-y-4">
            {uploadedDocs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              uploadedDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{doc.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Status: {doc.status}</p>
                    </div>
                  </div>
                  {doc.status === 'READY' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
