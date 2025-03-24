"use client";

import { useState } from "react";

interface AddSessionFormProps {
  instructorId: string;
  onSessionAdded: () => void;
}

export default function AddSessionForm({ instructorId, onSessionAdded }: AddSessionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/Api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, instructorId, description, startTime, endTime }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Failed to add session");
    } else {
      onSessionAdded();
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded-md bg-white shadow-md text-sm">
      <h2 className="text-md font-semibold mb-2">Add Session</h2>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full p-1 border rounded mb-1 text-black text-xs"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="w-full p-1 border rounded mb-1 text-black text-xs"
      />

      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
        className="w-full p-1 border rounded mb-1 text-black text-xs"
      />

      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
        className="w-full p-1 border rounded mb-1 text-black text-xs"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white p-1 rounded w-full text-xs disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
