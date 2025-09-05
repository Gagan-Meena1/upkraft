"use client";
import React, { useState } from "react";
import { Music, Upload, Loader, AlertCircle, CheckCircle2 } from "lucide-react";

const SongUploadPage = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setError("Please provide a title and select a music file");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("file", file);

      const res = await fetch("/Api/songs/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setSuccess("Song uploaded successfully!");
      setTitle("");
      setArtist("");
      setFile(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Music className="w-10 h-10 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-800">Upload Song</h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Song Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none text-gray-700"
              placeholder="Enter song title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Artist
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none text-gray-700"
              placeholder="Enter artist name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Music File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
               accept=".mp3,.gp5,.gp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-4 py-2 text-gray-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Song</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SongUploadPage;
