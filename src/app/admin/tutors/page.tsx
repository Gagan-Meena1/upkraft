"use client"
import Link from "next/link";
import { useState, useEffect } from "react";

interface Tutor {
  _id: string;
  username: string;
  contact: string;
  email: string;
}

export default function AllTutors() {
  const [Tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('studentId');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        console.log("Fetching Tutors from API...");
        
        const response = await fetch("/Api/admin/tutors");
        
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
          contact: Tutor.contact,
          email: Tutor.email
        }));
        
        setTutors(formattedData);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching Tutors:", error);
        setError(`Failed to load Tutors: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchTutors();
  }, []);

  const filteredTutors = Tutors.filter(Tutor => 
    Tutor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col text-gray-900">
      {/* Navigation */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
        <div className="font-extrabold text-2xl text-gray-800">
          <img src="/logo.png" alt="UPKRAFT" className="w-36 h-auto" />
        </div>
        <div className="flex space-x-4">
          <Link href="/admin/students">
            <button className="px-6 py-2 border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
              Students
            </button>
          </Link>
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
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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
                {filteredTutors.map((tutor) => (
                    <div 
                      key={tutor._id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-px relative"
                    >
                      <div className="bg-gray-900 h-3"></div>
                      <div className="absolute top-5 right-5">
                        <Link href={`/admin/tutors/tutorInfo?tutorId=${tutor._id}`}>
                          <button 
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                            aria-label="Student Information"
                          >
                            i
                          </button>
                        </Link>
                      </div>
                      <div className="p-6">
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
                        <div className="mt-6">
                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="font-bold text-xl text-gray-900 mb-4 md:mb-0">UPKRAFT</div>
          <div className="text-gray-500">© 2025 UPKRAFT. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}