"use client";

import { useEffect, useState } from "react";

interface Class {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface ClassListProps {
  instructorId: string;
}

export default function ClassList({ instructorId }: ClassListProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    const response = await fetch(`/Api/classes?instructorId=${instructorId}`);
    const data = await response.json();
    setClasses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    const response = await fetch(`/Api/classes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, instructorId }),
    });

    if (response.ok) {
      setClasses(classes.filter((cls) => cls._id !== id));
    }
  };

  // Handle Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
  
    const response = await fetch(`/Api/classes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingClass._id,
        title: editingClass.title,
        description: editingClass.description,
        startTime: editingClass.startTime,
        endTime: editingClass.endTime,
      }),
    });
  
    if (response.ok) {
      fetchClasses();  // Refresh list after update
      setEditingClass(null); // Close edit form
    } else {
      console.error("Failed to update class");
    }
  };
  
  return (
    <div className="p-3 text-sm">
      <h2 className="text-md font-semibold mb-2 text-black">Your Sessions</h2>

      {loading && <p className="text-black text-xs">Loading sessions...</p>}

      {!loading && classes.length === 0 && <p className="text-black text-xs">No sessions available.</p>}

      <ul className="space-y-2">
        {classes.map((cls) => (
          <li key={cls._id} className="p-2 border rounded shadow bg-white flex justify-between items-center text-xs">
            {editingClass && editingClass._id === cls._id ? (
              <form onSubmit={handleEditSubmit} className="w-full">
                <input
  type="text"
  value={editingClass.title}
  onChange={(e) => setEditingClass((prev) => ({ ...prev!, title: e.target.value }))}
  className="w-full p-1 border rounded text-black text-xs mb-1"
/>

<textarea
  value={editingClass.description}
  onChange={(e) => setEditingClass((prev) => ({ ...prev!, description: e.target.value }))}
  className="w-full p-1 border rounded text-black text-xs mb-1"
/>

<input
  type="datetime-local"
  value={editingClass.startTime}
  onChange={(e) => setEditingClass((prev) => ({ ...prev!, startTime: e.target.value }))}
  className="w-full p-1 border rounded text-black text-xs mb-1"
/>

<input
  type="datetime-local"
  value={editingClass.endTime}
  onChange={(e) => setEditingClass((prev) => ({ ...prev!, endTime: e.target.value }))}
  className="w-full p-1 border rounded text-black text-xs mb-1"
/>

                <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 mr-1">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div>
                  <h3 className="text-md font-semibold text-black">{cls.title}</h3>
                  <p className="text-black">{cls.description}</p>
                  <p className="text-black">
                    <strong>Start:</strong> {new Date(cls.startTime).toLocaleString()}
                  </p>
                  <p className="text-black">
                    <strong>End:</strong> {new Date(cls.endTime).toLocaleString()}
                  </p>
                </div>

                <div className="space-x-1">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cls._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
