'use client';
import { useState } from 'react';

export default function BulkUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setResults(null);
    setUploadProgress(0);

    try {
      // Process files in chunks to avoid timeout
      const chunkSize = 3; // Process 3 files at a time
      const chunks = [];
      for (let i = 0; i < files.length; i += chunkSize) {
        chunks.push(files.slice(i, i + chunkSize));
      }

      let totalSuccess = 0;
      let totalErrors = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const formData = new FormData();
        
        chunk.forEach((file) => {
          formData.append('files', file);
        });

        console.log(`Uploading chunk ${i + 1}/${chunks.length} with ${chunk.length} files`);

        // ✅ FIXED: Lowercase 'api'
        const response = await fetch('/Api/songs/batch-upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Chunk upload error:', errorText);
          totalErrors.push(`Chunk ${i + 1} failed: ${errorText}`);
          continue;
        }

        const data = await response.json();
        totalSuccess += data.success || chunk.length;
        
        if (data.errors) {
          totalErrors.push(...data.errors);
        }

        // Update progress
        setUploadProgress(((i + 1) / chunks.length) * 100);
      }

      setResults({
        success: totalSuccess,
        failed: files.length - totalSuccess,
        errors: totalErrors
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setResults({ 
        error: error.message || 'Upload failed',
        details: error.stack
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.toLowerCase();
      const validExtensions = ['.mp3', '.gp', '.gp3', '.gp4', '.gp5', '.gp6', '.gp7', '.gp8', '.dp'];
      return validExtensions.some(extension => ext.endsWith(extension));
    });
    
    // Check file sizes (limit to 10MB per file for better upload)
    const sizeFilteredFiles = validFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 10MB allowed.`);
        return false;
      }
      return true;
    });
    
    setFiles(sizeFilteredFiles);
    setResults(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bulk Music Upload</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Music Files (MP3, GP, GP3-GP8, DP) - Max 10MB each
          </label>
          <input
            type="file"
            multiple
            accept=".mp3,.gp,.gp3,.gp4,.gp5,.gp6,.gp7,.gp8,.dp"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported: MP3 (audio), GP/GP1-GP8/GPX (Guitar Pro), DP files. Files processed in chunks to avoid timeouts.
          </p>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Selected {files.length} files:
            </p>
            <div className="max-h-40 overflow-y-auto bg-gray-50 rounded p-3">
              {files.map((file, index) => (
                <div key={index} className="text-sm text-gray-700 flex justify-between">
                  <span>{file.name}</span>
                  <span className="text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Upload Progress: {uploadProgress.toFixed(0)}%
            </p>
          </div>
        )}

        <button
          onClick={uploadFiles}
          disabled={uploading || files.length === 0}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? `Uploading... (${uploadProgress.toFixed(0)}%)` : `Upload ${files.length} Files`}
        </button>

        {results && (
          <div className="mt-6 p-4 rounded">
            {results.error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-semibold text-red-800">Upload Failed</h3>
                <p className="text-red-600">{results.error}</p>
                {results.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-700">Show Details</summary>
                    <pre className="mt-2 text-xs text-red-500 overflow-auto bg-red-100 p-2 rounded">
                      {results.details}
                    </pre>
                  </details>
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
                    <h4 className="font-semibold text-yellow-800">Issues Found:</h4>
                    <ul className="text-sm text-yellow-700 max-h-40 overflow-y-auto">
                      {results.errors.map((error, index) => (
                        <li key={index} className="mb-1">• {error}</li>
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