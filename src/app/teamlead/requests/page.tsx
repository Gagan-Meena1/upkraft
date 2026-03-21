"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface ClassRequest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  tutor?: { _id: string; username: string; email: string };
  course?: { _id: string; name: string; title: string; courseName: string };
  deleteRequestStatus: string;
}

export default function TeamLeadRequestsPage() {
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/Api/teamlead/requests");
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.classes || []);
      } else {
        toast.error(data.error || "Failed to fetch requests");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (classId: string, action: "approve" | "reject") => {
    if (action === "approve" && !confirm("Are you sure you want to approve this request? This will cancel the class.")) {
      return;
    }
    if (action === "reject" && !confirm("Are you sure you want to reject this request? The class will remain scheduled.")) {
      return;
    }

    try {
      setActionLoading(classId);
      const res = await fetch(`/Api/teamlead/requests/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Request ${action}d successfully`);
        fetchRequests(); // Refresh the list
      } else {
        toast.error(data.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`An error occurred while trying to ${action} the request`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full border border-gray-300 hover:border-orange-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Class Delete Requests</h1>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <div className="flex items-center mb-6">
            <Clock className="text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Pending Requests ({requests.length})</h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No pending delete requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const courseName = req.course?.courseName || req.course?.title || req.course?.name || "N/A";
                return (
                  <div key={req._id} className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{req.title}</h3>
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{req.description || "No description provided."}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Tutor: </span>
                            {req.tutor?.username || "Unknown"}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Course: </span>
                            {courseName}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Time: </span>
                            {new Date(req.startTime).toLocaleString()} - {new Date(req.endTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(req._id, "approve")}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 w-full md:w-32"
                        >
                          {actionLoading === req._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(req._id, "reject")}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 w-full md:w-32"
                        >
                          {actionLoading === req._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
