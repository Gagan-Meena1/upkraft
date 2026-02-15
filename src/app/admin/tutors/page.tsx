"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';

// Create a non-SSR version of the component
const StudentFeedbackDashboardClient = dynamic(
  () => Promise.resolve(AllTutors),
  { ssr: false }
);


interface Tutor {
  _id: string;
  username: string;
  email: string;
  contact?: string;
  relationshipManager?:
  | string
  | {
    _id: string;
    username: string;
    email: string;
  }
  | null;
}

interface RelationshipManager {
  _id: string;
  username: string;
  email: string;
}

function AllTutors() {
  const [Tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [relationshipManagers, setRelationshipManagers] = useState<RelationshipManager[]>([]);
  const [assigningTutorId, setAssigningTutorId] = useState<string | null>(null);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isTeamLeadView = pathname.startsWith("/teamlead");   // ✅ true only on /teamlead/tutors

  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('studentId');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        console.log("Fetching Tutors from API...");

        const response = await fetch("/Api/admin/tutors");
        const res = await fetch("/Api/teamlead/relationship-managers");
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("API response:", data);

        // Extract the user array from the response
        const TutorsArray = data.user || [];

        if (!TutorsArray.length) {
          console.log("No Tutors found in API response");
        } else {
          console.log(`Found ${TutorsArray.length} Tutors in API response`);
        }

        // Map the response to our Tutor interface
        const formattedData: Tutor[] = TutorsArray.map((Tutor: any) => ({
          _id: Tutor._id,
          username: Tutor.username,
          email: Tutor.email,
          contact: Tutor.contact,
          relationshipManager: Tutor.relationshipManager || null
        }));

        setTutors(formattedData);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching Tutors:", error);
        setError(`Failed to load Tutors: ${error.message}`);
        setIsLoading(false);
      }
    };

    const fetchManagers = async () => {
      try {
        setLoadingManagers(true);
        const res = await fetch("/Api/teamlead/relationship-managers");
        const data = await res.json();
        if (res.ok && data.success) {
          setRelationshipManagers(data.managers || []);
        }
      } catch (err) {
        console.error("Error fetching relationship managers:", err);
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchTutors();
    if (isTeamLeadView) {
      fetchManagers();
    }
  }, [isTeamLeadView]);

  // map id -> full RM object once managers are loaded
  useEffect(() => {
    if (!isTeamLeadView || relationshipManagers.length === 0) return;

    setTutors((prev) =>
      prev.map((tutor) => {
        if (!tutor.relationshipManager || typeof tutor.relationshipManager === "object") {
          return tutor;
        }
        const rm = relationshipManagers.find((m) => m._id === tutor.relationshipManager);
        if (!rm) return tutor;
        return { ...tutor, relationshipManager: rm };
      })
    );
  }, [relationshipManagers, isTeamLeadView]);

  const handleAssignManager = async (tutorId: string, managerId: string) => {
    if (!managerId) return;
    try {
      setAssigningTutorId(tutorId);
      const res = await fetch("/Api/teamlead/assign-relationship-manager", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, relationshipManagerId: managerId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to assign relationship manager");
        return;
      }

      // Update tutors list locally
      setTutors((prev) =>
        prev.map((t) =>
          t._id === tutorId
            ? { ...t, relationshipManager: data.tutor.relationshipManager }
            : t
        )
      );
    } catch (err: any) {
      console.error("Assign RM error:", err);
      alert(err.message || "Failed to assign relationship manager");
    } finally {
      setAssigningTutorId(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/Api/users/logout');
      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Error during logout');
      console.error('Logout error:', error);
    }
  };


  const filteredTutors = Tutors.filter(Tutor =>
    Tutor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          {/* <img src="/logo.png" alt="UPKRAFT" className="w-36 h-auto" /> */}
          <Link href="/admin" className="cursor-pointer">
            <Image
              src="/logo.png"
              alt="UpKraft"
              width={288}
              height={72}
              priority
              className="object-contain w-36 h-auto"
            />
          </Link>
        </div>
        <div className="flex space-x-4">
          {!isTeamLeadView ? (
            <>
              <Link href="/admin/students">
                <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
                  Students
                </button>
              </Link>
              <Link href="/admin/">
                <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
                  back
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-4 md:mb-0">Tutor Directory</h1>
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email"
                className="w-full md:w-64 px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
                
              
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {filteredTutors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-500">No Tutors found matching your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Showing {filteredTutors.length} {filteredTutors.length === 1 ? 'Tutor' : 'Tutors'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTutors.map((tutor) => {
                    const currentRm =
                      typeof tutor.relationshipManager === "object"
                        ? tutor.relationshipManager
                        : relationshipManagers.find((rm) => rm._id === tutor.relationshipManager);

                    const currentRmId = currentRm?._id || "";

                    return (
                      <div key={tutor._id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="bg-gray-900 h-3"></div>
                        <div className="p-6 flex-1">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-orange-600 font-bold text-lg">
                              {tutor.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{tutor.username}</h3>
                          <div className="space-y-2 text-gray-600">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{tutor.email}</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{tutor.contact}</span>
                            </div>
                          </div>
                        </div>

                        {isTeamLeadView && (
                          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                Relationship Manager
                              </p>

                              {/* Current RM pill */}
                              <div className="flex-1 flex justify-end">
                                {currentRm ? (
                                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-medium max-w-full">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-[10px] font-bold">
                                      {currentRm.username.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="truncate max-w-[150px] text-right">
                                      {currentRm.username} ({currentRm.email})
                                    </span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-400 text-[11px] font-medium">
                                    Not assigned
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Assign / Change select */}
                            <div className="relative">
                              <select
                                className="block w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-800 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-400"
                                disabled={loadingManagers || assigningTutorId === tutor._id}
                                value={currentRmId}
                                onChange={(e) => handleAssignManager(tutor._id, e.target.value)}
                              >
                                <option value="">
                                  {currentRm ? "Change relationship manager" : "Assign relationship manager"}
                                </option>
                                {relationshipManagers.map((rm) => (
                                  <option key={rm._id} value={rm._id}>
                                    {rm.username} ({rm.email})
                                  </option>
                                ))}
                              </select>

                              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5 7.5L10 12.5L15 7.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>


    </div>
  );
}
// Export this as the default component
export default function ViewPerformancePage() {
  return <StudentFeedbackDashboardClient />;
}