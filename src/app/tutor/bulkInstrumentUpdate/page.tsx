"use client";
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function InstrumentUpdatePage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if it's an Excel file
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an Excel file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await fetch('/Api/bulkInstrument', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert(`✅ Successfully updated ${data.success} songs!`);
      } else {
        alert(`⚠️ Completed with some issues. Check the results below.`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        error: error.message || 'Failed to update instruments'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Update Song Instruments
            </h1>
            <p className="text-gray-600">
              Upload an Excel file to update Primary Instrument Focus for your songs
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Excel File Requirements:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-7">
              <li>• Column 1: <strong>Song</strong> - Song title (as stored in database)</li>
              <li>• Column 2: <strong>Artist</strong> - Artist name</li>
              <li>• Column 3: <strong>Primary_Instrument_Focus</strong> - New instrument value</li>
            </ul>
          </div>

          {/* Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-upload"
                disabled={uploading}
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                {file ? (
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Click to upload Excel file
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports .xlsx and .xls files
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Update Instruments
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={uploading}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Results</h2>
              
              {result.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-red-700">{result.error}</p>
                      {result.details && (
                        <p className="text-sm text-red-600 mt-1">{result.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{result.success}</div>
                      <div className="text-sm text-green-700 mt-1">Updated</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-red-600">{result.failed}</div>
                      <div className="text-sm text-red-700 mt-1">Failed</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">{result.notFound}</div>
                      <div className="text-sm text-yellow-700 mt-1">Not Found</div>
                    </div>
                  </div>

                  {/* Success Rate */}
                  {result.summary && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        Success Rate: <span className="font-bold text-gray-900">{result.summary.successRate}</span>
                      </p>
                    </div>
                  )}

                  {/* Updated Songs List */}
                  {result.updatedSongs && result.updatedSongs.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">✅ Successfully Updated:</h3>
                      <div className="max-h-64 overflow-y-auto border rounded-lg">
                        {result.updatedSongs.map((song, idx) => (
                          <div key={idx} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                            <p className="font-medium text-gray-800">
                              {song.title} <span className="text-gray-500">by {song.artist}</span>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="line-through text-red-600">{song.oldInstrument}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600 font-medium">{song.newInstrument}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors List */}
                  {result.errors && result.errors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">❌ Errors:</h3>
                      <div className="max-h-64 overflow-y-auto border rounded-lg bg-red-50">
                        {result.errors.map((error, idx) => (
                          <div key={idx} className="p-3 border-b last:border-b-0">
                            <p className="font-medium text-red-800">
                              {error.song} <span className="text-red-600">by {error.artist}</span>
                            </p>
                            <p className="text-sm text-red-700 mt-1">{error.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}