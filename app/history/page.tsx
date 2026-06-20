"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  Activity, 
  Sparkles, 
  Plus, 
  HeartPulse, 
  ChevronRight, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIDoctorAgents } from "@/share/list";

interface HistoryItem {
  id: number;
  sessionId: string;
  notes: string;
  selectedDoctor: any; // string or object
  report?: any;
  created_at_timestamp?: string;
}

export default function UserHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "active">("all");
  const [isMounted, setIsMounted] = useState(false);

  const gethistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/userHistory");
      setHistory(res.data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gethistory();
    setIsMounted(true);
  }, []);

  // Map database selectedDoctor format to a standardized Doctor object
  const getDoctorInfo = (selectedDoctorField: any) => {
    if (!selectedDoctorField) {
      return { specialist: "General Physician", image: "/doctor1.png", description: "Clinical Specialist" };
    }
    if (typeof selectedDoctorField === "string") {
      const matched = AIDoctorAgents.find(
        (doc) => doc.specialist.toLowerCase() === selectedDoctorField.toLowerCase()
      );
      return matched || { specialist: selectedDoctorField, image: "/doctor1.png", description: "Clinical Specialist" };
    }
    if (typeof selectedDoctorField === "object") {
      return {
        specialist: selectedDoctorField.specialist || "Medical Agent",
        image: selectedDoctorField.image || "/doctor1.png",
        description: selectedDoctorField.description || "Clinical Specialist"
      };
    }
    return { specialist: "General Physician", image: "/doctor1.png", description: "Clinical Specialist" };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || !isMounted) return "Recent";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Recent";
    }
  };

  // Filter & Search Logic
  const filteredHistory = history.filter((item) => {
    const doctor = getDoctorInfo(item.selectedDoctor);
    const hasReport = item.report && Object.keys(item.report).length > 0;
    
    // Status Filter
    if (activeFilter === "completed" && !hasReport) return false;
    if (activeFilter === "active" && hasReport) return false;

    // Search Query Match
    const searchLower = searchQuery.toLowerCase();
    const notesMatch = (item.notes || "").toLowerCase().includes(searchLower);
    const doctorMatch = (doctor.specialist || "").toLowerCase().includes(searchLower);
    const diagnosisMatch = item.report?.diagnosis 
      ? (item.report.diagnosis || "").toLowerCase().includes(searchLower)
      : false;

    return notesMatch || doctorMatch || diagnosisMatch;
  });

  const completedCount = history.filter(item => item.report && Object.keys(item.report).length > 0).length;

  return (
    <div className="py-8 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <HeartPulse className="w-8 h-8 text-[#5cac94]" />
            Consultation History
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
            Access logs of your conversational health assessments, tentative diagnoses, and medical advice summaries.
          </p>
        </div>

        {/* Stats card */}
        {isMounted && history.length > 0 && (
          <div className="flex gap-4">
            <div className="bg-[#5cac94]/10 border border-[#5cac94]/20 rounded-xl px-4 py-2 text-center">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Total Consults</span>
              <span className="text-lg font-bold text-[#4a9680]">{history.length}</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-4 py-2 text-center">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Reports Ready</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, AI doctors, diagnoses..."
            className="w-full pl-9 pr-4 py-2 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5cac94]/30 focus:border-[#5cac94]/40 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 mr-1 hidden sm:block" />
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#5cac94] text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-350"
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "completed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-350"
            }`}
          >
            Reports Ready
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === "active"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-350"
            }`}
          >
            Active Sessions
          </button>
        </div>
      </div>

      {/* Skeletons Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div 
              key={n} 
              className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-14 bg-slate-50 dark:bg-slate-800/40 rounded-xl" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 bg-white dark:bg-slate-900 text-center max-w-2xl mx-auto mt-10 shadow-sm">
          <div className="p-5 bg-[#5cac94]/10 rounded-full mb-5 text-[#5cac94] scale-110">
            <Activity className="w-10 h-10 animate-pulse" />
          </div>
          <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">No consultations found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2.5 mb-6">
            {searchQuery 
              ? "We couldn't find any consultations matching your search queries or selected status filters."
              : "You haven't had any consultations yet. Consult with our specialist AI medical agents now."}
          </p>
          {searchQuery ? (
            <Button onClick={() => { setSearchQuery(""); setActiveFilter("all"); }} className="bg-slate-800 text-white font-bold rounded-xl px-5 py-2 hover:bg-slate-900">
              Clear Filters
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-[#5cac94] text-white hover:bg-[#4a9680] font-bold rounded-xl px-5 py-2 shadow-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Start Consultations
              </Button>
            </Link>
          )}
        </div>
      ) : (
        /* History Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => {
            const doctor = getDoctorInfo(item.selectedDoctor);
            const hasReport = item.report && Object.keys(item.report).length > 0;
            const dateStr = formatDate(item.created_at_timestamp);

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between border border-slate-100/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Doctor Info Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden relative shrink-0 border border-slate-100 dark:border-slate-800">
                      {doctor.image ? (
                        <Image
                          src={doctor.image}
                          alt={doctor.specialist}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#5cac94]/10 text-[#5cac94] text-xs font-bold">
                          MD
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm md:text-base">
                        Dr. {doctor.specialist.split(" ")[0]}
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-xs truncate">
                        {doctor.specialist} Specialist
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 border ${
                        hasReport
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                          : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
                      }`}
                    >
                      {hasReport ? "Report Ready" : "Active Session"}
                    </span>
                  </div>

                  {/* Notes / Symptoms Card */}
                  <div className="mt-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl p-3 border border-slate-100/50 dark:border-slate-900/40">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Patient Notes / Symptoms
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-3 italic font-normal leading-relaxed">
                      &ldquo;{item.notes || "No symptoms description provided."}&rdquo;
                    </p>
                  </div>

                  {/* Diagnosis summary if exists */}
                  {hasReport && item.report?.diagnosis && (
                    <div className="mt-3 flex items-start gap-1.5 text-xs text-[#5cac94] bg-[#5cac94]/5 dark:bg-[#5cac94]/5 p-2 rounded-lg border border-[#5cac94]/10">
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <p className="line-clamp-2 leading-relaxed">
                        <span className="font-semibold">AI Insights: </span>
                        {item.report.diagnosis}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {/* Divider line */}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

                  {/* Footer Meta (Timestamp) */}
                  <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </div>

                  {/* Redirect Link button */}
                  <Link href={`/dashboard/medicalAgent/${item.sessionId}`}>
                    <button
                      className={`w-full flex items-center justify-center gap-1.5 mt-3.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-sm ${
                        hasReport
                          ? "bg-[#5cac94] text-white hover:bg-[#4a9680] hover:shadow-md"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {hasReport ? "View Medical Report" : "Resume Conversation"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
