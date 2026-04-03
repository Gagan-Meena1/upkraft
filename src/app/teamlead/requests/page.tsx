"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";

interface ClassRequest {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  tutor?: { _id: string; username: string; email: string };
  course?: { _id: string; name: string; title: string; courseName: string };
  deleteRequestStatus: string;
  deleteRequestType?: string;
  deleteRequestStudents?: { _id: string; username: string; email: string }[];
  students?: { _id: string; username: string; email: string }[];
}

interface ReassignRequest {
  _id: string;
  student: { _id: string; username: string; email: string };
  oldTutor: { _id: string; username: string; email: string };
  newTutor: { _id: string; username: string; email: string };
  relationshipManager: { _id: string; username: string; email: string };
  status: string;
  createdAt: string;
}

export default function TeamLeadRequestsPage() {
  const [requests, setRequests] = useState<ClassRequest[]>([]);
  const [reassignRequests, setReassignRequests] = useState<ReassignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/Api/teamlead/requests");
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.classes || []);
        setReassignRequests(data.reassignRequests || []);
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

  const handleAction = async (id: string, action: "approve" | "reject", type: "class" | "reassign", isPartial?: boolean) => {
    let confirmMsg = "";
    if (type === "class") {
      confirmMsg = action === "approve" 
        ? (isPartial ? "Are you sure you want to approve this partial deletion request? This will remove the selected students from the class." : "Are you sure you want to approve this request? This will completely cancel and delete the class.")
        : (isPartial ? "Are you sure you want to reject this partial deletion request? The students will remain in the class." : "Are you sure you want to reject this request? The class will remain scheduled.");
    } else {
      confirmMsg = action === "approve"
        ? "Are you sure you want to approve this student reassignment request?"
        : "Are you sure you want to reject this student reassignment request?";
    }

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoading(id);
      const endpoint = type === "class" 
        ? `/Api/teamlead/requests/${id}`
        : `/Api/teamlead/reassign-requests/${id}`;

      const res = await fetch(endpoint, {
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
    <DashboardLayout userType="teamlead">
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
              <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Class Delete Requests Section */}
            <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Clock className="text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Class Delete Requests ({requests.length})</h2>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No pending delete requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => {
                    const courseName = req.course?.courseName || req.course?.title || req.course?.name || "N/A";
                    return (
                      <div key={req._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-md font-bold text-gray-900 truncate">{req.title}</h3>
                            {req.deleteRequestType === 'partial' ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                PARTIAL
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                FULL
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div><span className="font-semibold">Tutor:</span> {req.tutor?.username || "Unknown"}</div>
                            <div><span className="font-semibold">Course:</span> {courseName}</div>
                            <div>
                              <span className="font-semibold">Student(s):</span> {
                                req.deleteRequestType === 'partial' 
                                  ? (req.deleteRequestStudents?.map(s => s.username).join(", ") || "None")
                                  : (req.students?.map(s => s.username).join(", ") || "None")
                              }
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAction(req._id, "approve", "class", req.deleteRequestType === "partial")}
                              disabled={actionLoading !== null}
                              className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {actionLoading === req._id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : "Approve"}
                            </button>
                            <button
                              onClick={() => handleAction(req._id, "reject", "class", req.deleteRequestType === "partial")}
                              disabled={actionLoading !== null}
                              className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Student Reassign Requests Section */}
            <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <Clock className="text-purple-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Student Reassignment ({reassignRequests.length})</h2>
              </div>

              {reassignRequests.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No pending reassignment requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reassignRequests.map((req) => (
                    <div key={req._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-bold text-gray-900 truncate">Reassign: {req.student?.username}</h3>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                            REASSIGN
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Old Tutor:</span>
                            <span className="text-gray-900">{req.oldTutor?.username}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-purple-600">New Tutor:</span>
                            <span className="text-gray-900 font-bold">{req.newTutor?.username}</span>
                          </div>
                          <div className="pt-1 border-t border-gray-200 flex justify-between items-center text-[10px]">
                            <span className="italic">Requested by RM: {req.relationshipManager?.username}</span>
                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAction(req._id, "approve", "reassign")}
                            disabled={actionLoading !== null}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                          >
                            {actionLoading === req._id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : "Approve"}
                          </button>
                          <button
                            onClick={() => handleAction(req._id, "reject", "reassign")}
                            disabled={actionLoading !== null}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
