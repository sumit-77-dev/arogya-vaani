"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AddNewSessionDialog } from './AddNewSessionDialog'
import axios from 'axios'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

interface HistoryItem {
  id: number;
  sessionId: string;
  notes: string;
  selectedDoctor: {
    specialist: string;
    image?: string;
    description?: string;
  };
  report?: any;
  created_at_timestamp?: string;
}

function HistoryList() {
    const [historyList, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const fetchHistory = async()=>{
        try {
            const res = await axios.get("/api/userHistory");
            setHistory(res.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(()=>{
        fetchHistory();
        setIsMounted(true);
    },[])

    const formatDate = (dateString?: string) => {
        if (!dateString || !isMounted) return "Recent";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch (error) {
            return "Recent";
        }
    };

    if (loading) {
        return (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Calendar className="w-5 h-5" />
                            </span>
                            Recent Consultations
                        </h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm animate-pulse space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

  return (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </span>
                    Recent Consultations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your previous AI medical chat sessions and reports</p>
            </div>
        </div>

        {historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 bg-slate-50/30 dark:bg-slate-900/10 text-center max-w-2xl mx-auto mt-4">
                <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-full mb-4">
                    <Image src="/medical-assistance.png" alt="medical-assistant" width={100} height={100} className="opacity-90" />
                </div>
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">No consultations yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mb-6">
                    Consult with our AI-powered specialized doctors for instant medical guidance.
                </p>
                <AddNewSessionDialog />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyList.map((item) => {
                    const doctor = item.selectedDoctor;
                    const hasReport = item.report && Object.keys(item.report).length > 0;
                    const dateStr = formatDate(item.created_at_timestamp);

                    return (
                        <div 
                            key={item.id} 
                            className="flex flex-col justify-between border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        >
                            <div>
                                {/* Doctor Info Header */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-100 dark:border-slate-800">
                                        {doctor?.image ? (
                                            <Image 
                                                src={doctor.image} 
                                                alt={doctor?.specialist || "Doctor"} 
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                                MD
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm">
                                            Dr. {doctor?.specialist?.split(' ')[0] || "Specialist"}
                                        </h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                                            {doctor?.specialist || "Medical Agent"}
                                        </p>
                                    </div>
                                    {/* Status Badge */}
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                                        hasReport 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                                            : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                                    }`}>
                                        {hasReport ? 'Report Ready' : 'Active Session'}
                                    </span>
                                </div>

                                {/* Notes / Symptoms */}
                                <div className="mt-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-100/50 dark:border-slate-800/10">
                                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Patient Symptoms / Notes</p>
                                    <p className="text-slate-600 dark:text-slate-350 text-xs line-clamp-2 italic">
                                        &ldquo;{item.notes || "No symptoms description provided."}&rdquo;
                                    </p>
                                </div>
                            </div>

                            <div>
                                {/* Timestamp */}
                                <div className="mt-4 flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{dateStr}</span>
                                </div>

                                {/* Action Link */}
                                <Link
                                    href={`/dashboard/medicalAgent/${item.sessionId}`}
                                    className={`w-full flex items-center justify-center gap-1.5 mt-4 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                        hasReport
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    {hasReport ? 'View Report & Chat' : 'Resume Consultation'}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  )
}

export default HistoryList