"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Tutor {
  _id: string;
  username: string;
  email: string;
  contact?: string;
}

const RelationshipManagerDashboard: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/Api/relationship-manager/tutors", {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load tutors");
        }

        setTutors(data.tutors || []);
      } catch (err: any) {
        console.error("Error fetching RM tutors:", err);
        setError(err.message || "Failed to load tutors");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700 text-lg">Loading your tutors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-md rounded-lg px-6 py-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Your Assigned Tutors
        </h1>
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Logout
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tutors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tutors assigned yet
            </h2>
            <p className="text-gray-500">
              Once a Team Lead assigns tutors to you, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                    {tutor.username?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {tutor.username}
                    </div>
                    <div className="text-xs text-gray-500">Tutor</div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">Email: </span>
                    <span className="break-all">{tutor.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Contact: </span>
                    <span>{tutor.contact || "Not available"}</span>
                  </div>
                </div>

                {/* Login button for this tutor */}
                <div className="mt-4">
                  <Link
                    href="/login"
                    className="w-full inline-flex justify-center items-center px-4 py-2 !bg-purple-500 !text-white !text-sm font-medium rounded-lg !hover:bg-purple-700 transition"
                  >
                    Login
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RelationshipManagerDashboard;