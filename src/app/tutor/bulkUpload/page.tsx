// app/tutor/bulkUpload/page.tsx
'use client';
import { useState } from 'react';

export default function BulkUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setResults(null);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      console.log('Starting bulk upload with', files.length, 'files');
      
      // ✅ FIXED: Correct API endpoint
      const response = await fetch('/Api/songs/batch-upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error(`Server returned non-JSON response: ${responseText.slice(0, 100)}...`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText.trim()) {
        throw new Error('Server returned empty response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON: ${responseText.slice(0, 100)}...`);
      }

      console.log('Upload successful:', data);
      setResults(data);
      
    } catch (error) {
      console.error('Upload error:', error);
      setResults({ 
        error: error.message || 'Upload failed',
        details: error.stack
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.toLowerCase();
      return ext.endsWith('.mp3') || 
             ext.endsWith('.gp') || 
             ext.endsWith('.gp3') || 
             ext.endsWith('.gp4') || 
             ext.endsWith('.gp5') || 
             ext.endsWith('.gp6') || 
             ext.endsWith('.gp7') || 
             ext.endsWith('.gp8') || 
             ext.endsWith('.dp');
    });
    setFiles(validFiles);
    setResults(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bulk Music Upload</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Music Files (MP3, GP, GP3-GP8, DP)
          </label>
          <input
            type="file"
            multiple
            accept=".mp3,.gp,.gp3,.gp4,.gp5,.gp6,.gp7,.gp8,.dp"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Selected {files.length} files:
            </p>
            <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-3">
              {files.map((file, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={uploadFiles}
          disabled={uploading || files.length === 0}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} Files`}
        </button>

        {results && (
          <div className="mt-6 p-4 rounded">
            {results.error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-semibold text-red-800">Upload Failed</h3>
                <p className="text-red-600">{results.error}</p>
                {results.details && (
                  <pre className="mt-2 text-xs text-red-500 overflow-auto">
                    {results.details}
                  </pre>
                )}
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <h3 className="font-semibold text-green-800">Upload Complete</h3>
                  <p className="text-green-600">
                    Successfully uploaded {results.success} files
                    {results.failed > 0 && `, ${results.failed} failed`}
                  </p>
                </div>
                
                {results.errors && results.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <h4 className="font-semibold text-yellow-800">Errors:</h4>
                    <ul className="text-sm text-yellow-700">
                      {results.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}