"use client";

import { useState, useEffect } from "react";
import { Search, Download, Filter, Phone, Mail, MapPin, User, Building2, GraduationCap, RefreshCw, ChevronLeft, Calendar, TrendingUp, Users, Building } from "lucide-react";

// Types
interface StudentTutorLead {
  _id: string;
  userType: "Student" | "Tutor";
  name: string;
  city: string;
  contactNumber: string;
  instrument: string;
  createdAt: string;
}

interface InstitutionLead {
  _id: string;
  type: "School" | "Academy";
  role: string;
  name: string;
  phone: string;
  email: string;
  institutionName: string;
  city: string;
  studentCount?: number;
  createdAt: string;
}

export default function LeadsDashboard() {
  const [activeTab, setActiveTab] = useState<"individual" | "institution">("individual");
  
  // Individual Leads State
  const [individualLeads, setIndividualLeads] = useState<StudentTutorLead[]>([]);
  const [individualFilter, setIndividualFilter] = useState<"All" | "Student" | "Tutor">("All");
  const [individualSearch, setIndividualSearch] = useState("");
  const [individualLoading, setIndividualLoading] = useState(false);
  
  // Institution Leads State
  const [institutionLeads, setInstitutionLeads] = useState<InstitutionLead[]>([]);
  const [institutionFilter, setInstitutionFilter] = useState<"All" | "School" | "Academy">("All");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutionLoading, setInstitutionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    individual: { total: 0, students: 0, tutors: 0 },
    institution: { total: 0, schools: 0, academies: 0 },
  });

  // Fetch Individual Leads
  const fetchIndividualLeads = async () => {
    setIndividualLoading(true);
    try {
      const filterParam = individualFilter !== "All" ? `?userType=${individualFilter}` : "";
      const response = await fetch(`/Api/express-interest${filterParam}`);
      const data = await response.json();
      
      if (data.success) {
        setIndividualLeads(data.data);
        setStats(prev => ({
          ...prev,
          individual: {
            total: data.meta.total,
            students: data.meta.students,
            tutors: data.meta.tutors,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching individual leads:", error);
    } finally {
      setIndividualLoading(false);
    }
  };

  // Fetch Institution Leads
  const fetchInstitutionLeads = async () => {
    setInstitutionLoading(true);
    try {
      const filterParam = institutionFilter !== "All" ? `?type=${institutionFilter}` : "";
      const response = await fetch(`/Api/institution-interest${filterParam}`);
      const data = await response.json();
      
      if (data.success) {
        setInstitutionLeads(data.data);
        setStats(prev => ({
          ...prev,
          institution: {
            total: data.meta.total,
            schools: data.meta.schools,
            academies: data.meta.academies,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching institution leads:", error);
    } finally {
      setInstitutionLoading(false);
    }
  };

  // Load data on mount and filter change
  useEffect(() => {
    fetchIndividualLeads();
  }, [individualFilter]);

  useEffect(() => {
    fetchInstitutionLeads();
  }, [institutionFilter]);

  // Filter leads by search
  const filteredIndividualLeads = individualLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(individualSearch.toLowerCase()) ||
      lead.city.toLowerCase().includes(individualSearch.toLowerCase()) ||
      lead.instrument.toLowerCase().includes(individualSearch.toLowerCase()) ||
      lead.contactNumber.includes(individualSearch)
  );

  const filteredInstitutionLeads = institutionLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      lead.institutionName.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      lead.city.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      lead.email.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      lead.phone.includes(institutionSearch)
  );

  // Export to CSV
  const exportToCSV = (type: "individual" | "institution") => {
    const leads = type === "individual" ? filteredIndividualLeads : filteredInstitutionLeads;
    
    let csv = "";
    if (type === "individual") {
      csv = "Type,Name,City,Contact Number,Instrument,Registered At\n";
      leads.forEach((lead: any) => {
        csv += `${lead.userType},${lead.name},${lead.city},${lead.contactNumber},${lead.instrument},${new Date(lead.createdAt).toLocaleString()}\n`;
      });
    } else {
      csv = "Type,Role,Name,Phone,Email,Institution Name,City,Student Count,Registered At\n";
      leads.forEach((lead: any) => {
        csv += `${lead.type},${lead.role},${lead.name},${lead.phone},${lead.email},${lead.institutionName},${lead.city},${lead.studentCount || "N/A"},${new Date(lead.createdAt).toLocaleString()}\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Leads Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage and track all your student, tutor, and institution leads</p>
            </div>
            <a
              href="/admin"
              className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium border border-gray-200 w-fit"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.individual.students}
            icon={<GraduationCap className="w-7 h-7" />}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Total Tutors"
            value={stats.individual.tutors}
            icon={<User className="w-7 h-7" />}
            color="purple"
            trend="+8%"
          />
          <StatCard
            title="Total Schools"
            value={stats.institution.schools}
            icon={<Building2 className="w-7 h-7" />}
            color="green"
            trend="+15%"
          />
          <StatCard
            title="Total Academies"
            value={stats.institution.academies}
            icon={<Building className="w-7 h-7" />}
            color="orange"
            trend="+10%"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("individual")}
              className={`flex-1 px-8 py-5 text-base font-semibold transition-all relative ${
                activeTab === "individual"
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                <span>Students & Tutors</span>
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "individual" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {stats.individual.total}
                </span>
              </div>
              {activeTab === "individual" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("institution")}
              className={`flex-1 px-8 py-5 text-base font-semibold transition-all relative ${
                activeTab === "institution"
                  ? "text-purple-600 bg-purple-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>Schools & Academies</span>
                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "institution" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {stats.institution.total}
                </span>
              </div>
              {activeTab === "institution" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Individual Leads Tab */}
        {activeTab === "individual" && (
          <div className="space-y-6">
            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, city, instrument, or contact..."
                    value={individualSearch}
                    onChange={(e) => setIndividualSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm shadow-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={individualFilter}
                    onChange={(e) => setIndividualFilter(e.target.value as any)}
                    className="px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm font-medium shadow-sm bg-white"
                  >
                    <option value="All">All Types</option>
                    <option value="Student">Students</option>
                    <option value="Tutor">Tutors</option>
                  </select>
                  <button
                    onClick={fetchIndividualLeads}
                    className="px-5 py-3.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all shadow-sm border border-gray-200 hover:shadow-md"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => exportToCSV("individual")}
                    className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-medium"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Leads List */}
            {individualLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                <p className="mt-6 text-gray-600 font-medium">Loading leads...</p>
              </div>
            ) : filteredIndividualLeads.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No leads found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredIndividualLeads.map((lead) => (
                  <IndividualLeadCard key={lead._id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Institution Leads Tab */}
        {activeTab === "institution" && (
          <div className="space-y-6">
            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, institution, city, email, or phone..."
                    value={institutionSearch}
                    onChange={(e) => setInstitutionSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm shadow-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={institutionFilter}
                    onChange={(e) => setInstitutionFilter(e.target.value as any)}
                    className="px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm font-medium shadow-sm bg-white"
                  >
                    <option value="All">All Types</option>
                    <option value="School">Schools</option>
                    <option value="Academy">Academies</option>
                  </select>
                  <button
                    onClick={fetchInstitutionLeads}
                    className="px-5 py-3.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all shadow-sm border border-gray-200 hover:shadow-md"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => exportToCSV("institution")}
                    className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-medium"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Leads List */}
            {institutionLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                <p className="mt-6 text-gray-600 font-medium">Loading leads...</p>
              </div>
            ) : filteredInstitutionLeads.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No leads found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredInstitutionLeads.map((lead) => (
                  <InstitutionLeadCard key={lead._id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, trend }: any) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };

  const bgColorClasses = {
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-md`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Individual Lead Card
function IndividualLeadCard({ lead }: { lead: StudentTutorLead }) {
  const isStudent = lead.userType === "Student";
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isStudent ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-purple-500 to-purple-600"} shadow-md`}>
            {isStudent ? (
              <GraduationCap className="w-7 h-7 text-white" />
            ) : (
              <User className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{lead.name}</h3>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
              isStudent ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
            }`}>
              {lead.userType}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5 mb-5">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-sm font-medium">{lead.city}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-gray-500" />
          </div>
          <a href={`tel:${lead.contactNumber}`} className="text-sm font-medium hover:text-purple-600 transition-colors">
            {lead.contactNumber}
          </a>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{lead.instrument}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 mb-5">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <p className="text-xs font-medium">
            Registered: {new Date(lead.createdAt).toLocaleString("en-IN", { 
              dateStyle: "medium", 
              timeStyle: "short" 
            })}
          </p>
        </div>
      </div>

      <a
        href={`tel:${lead.contactNumber}`}
        className="block w-full px-5 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
      >
        <Phone className="w-4 h-4 inline mr-2" />
        Call Now
      </a>
    </div>
  );
}

// Institution Lead Card
function InstitutionLeadCard({ lead }: { lead: InstitutionLead }) {
  const isSchool = lead.type === "School";
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5 flex-1">
          <div className={`p-3.5 rounded-xl ${isSchool ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-orange-500 to-orange-600"} shadow-md flex-shrink-0`}>
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{lead.institutionName}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                isSchool ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              }`}>
                {lead.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-5 bg-gray-50 px-3 py-2 rounded-lg inline-block">
              {lead.role}: {lead.name}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium">{lead.city}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                <a href={`tel:${lead.phone}`} className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {lead.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-600 md:col-span-2">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <a href={`mailto:${lead.email}`} className="text-sm font-medium hover:text-purple-600 transition-colors truncate">
                  {lead.email}
                </a>
              </div>
              {lead.studentCount && (
                <div className="flex items-center gap-3 text-gray-600 md:col-span-2">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{lead.studentCount} students</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <p className="text-xs font-medium">
                  Registered: {new Date(lead.createdAt).toLocaleString("en-IN", { 
                    dateStyle: "medium", 
                    timeStyle: "short" 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col gap-3 md:w-auto w-full">
          <a
            href={`tel:${lead.phone}`}
            className="flex-1 md:flex-none px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg"
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Call
          </a>
          <a
            href={`mailto:${lead.email}`}
            className="flex-1 md:flex-none px-6 py-3.5 bg-gray-100 text-gray-700 text-center rounded-xl hover:bg-gray-200 transition-all text-sm font-semibold whitespace-nowrap border border-gray-200"
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}