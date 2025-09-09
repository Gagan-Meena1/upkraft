"use client"
import React, { useState } from 'react';
import { Upload, FileText, Music, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function EnhancedBatchUpload() {
  const [files, setFiles] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['mp3', 'gp', 'gp1', 'gp2', 'gp3', 'gp4', 'gp5', 'gp6', 'gp7', 'gp8', 'gpx', 'dp','mxl'].includes(extension);
    });
    setFiles(validFiles);
  };

  const handleExcelSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setExcelFile(file);
    } else {
      alert('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !excelFile) {
      alert('Please select both song files and an Excel file');
      return;
    }

    setUploading(true);
    setResults(null);

    try {
      const formData = new FormData();
      
      // Add song files
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Add Excel file
      formData.append('excelFile', excelFile);

      const response = await fetch('/Api/bulkUpload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setResults(result);

      if (result.success > 0) {
        // Clear files on success
        setFiles([]);
        setExcelFile(null);
        document.getElementById('song-files').value = '';
        document.getElementById('excel-file').value = '';
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setResults({
        success: 0,
        failed: files.length,
        errors: ['Network error: ' + error.message]
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Music className="w-6 h-6 mr-2 text-blue-600" />
          Enhanced Batch Song Upload
        </h2>
        <p className="text-gray-600">
          Upload your song files and Excel spreadsheet to automatically match metadata
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Song Files Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label htmlFor="song-files" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-700">Select Song Files</span>
              <p className="text-sm text-gray-500 mt-2">
                .mp3, .gp, .gp1-gp8, .gpx, .dp, .mxl files
              </p>
            </label>
            <input
              id="song-files"
              type="file"
              multiple
              accept=".mp3,.gp,.gp1,.gp2,.gp3,.gp4,.gp5,.gp6,.gp7,.gp8,.gpx,.dp,.mxl"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {files.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="font-medium text-blue-800 mb-2">
                {files.length} song files selected:
              </p>
              <div className="max-h-32 overflow-y-auto">
                {files.slice(0, 5).map((file, index) => (
                  <p key={index} className="text-sm text-blue-600 truncate">
                    {file.name}
                  </p>
                ))}
                {files.length > 5 && (
                  <p className="text-sm text-blue-500">...and {files.length - 5} more</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Excel File Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label htmlFor="excel-file" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-700">Select Excel File</span>
              <p className="text-sm text-gray-500 mt-2">
                .xlsx or .xls with song metadata
              </p>
            </label>
            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelSelect}
              className="hidden"
            />
          </div>
          
          {excelFile && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="font-medium text-green-800">✅ Excel file selected:</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-green-600 truncate flex-1 mr-2">📊 {excelFile.name}</p>
                <span className="text-green-500 text-xs whitespace-nowrap">
                  {(excelFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || !excelFile || uploading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <span className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </span>
          ) : (
            'Upload Songs with Metadata'
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            Upload Results
          </h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{results.success}</div>
              <div className="text-sm text-green-700">Successful</div>
            </div>
            <div className="bg-red-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{results.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.matchingStats?.matched || 0}
              </div>
              <div className="text-sm text-blue-700">Excel Matched</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {results.matchingStats?.unmatched || 0}
              </div>
              <div className="text-sm text-yellow-700">Unmatched</div>
            </div>
          </div>

          {/* Summary Info */}
          {results.summary && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                <strong>Success Rate:</strong> {results.summary.successRate} | 
                <strong> Excel Matching Rate:</strong> {results.summary.matchingRate}
              </p>
            </div>
          )}

          {/* Uploaded Files */}
          {results.uploadedFiles && results.uploadedFiles.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Successfully Uploaded:</h4>
              <div className="max-h-40 overflow-y-auto bg-white rounded border">
                {results.uploadedFiles.map((file, index) => (
                  <div key={index} className="p-2 border-b last:border-b-0 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{file.title}</span>
                      {file.artist && <span className="text-gray-600"> by {file.artist}</span>}
                      <div className="text-xs text-gray-500">
                        {file.genre} • {file.difficulty} • {file.year}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {file.matchedFromExcel ? (
                        <CheckCircle className="w-4 h-4 text-green-500" title="Matched with Excel" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" title="Used filename data" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {results.errors && results.errors.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                Errors:
              </h4>
              <div className="max-h-32 overflow-y-auto bg-red-50 rounded border border-red-200">
                {results.errors.map((error, index) => (
                  <p key={index} className="p-2 text-sm text-red-700 border-b last:border-b-0">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}