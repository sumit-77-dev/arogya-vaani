"use client";

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface Doctor {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId: string;
  subscriptionRequired: boolean;
  defaultNote: any;
}

interface DoctorAgentCardProps {
  doctor: Doctor;
}

function DoctorAgentCard({ doctor }: DoctorAgentCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const  onStartConsultation = async(note: string, selectedDoctor: string) => {
          setLoading(true);
          const result = await axios.post('/api/session-chat', {
            notes: note,
            selectedDoctor: selectedDoctor
          })
          console.log(result.data);
          if(result.data?.sessionId){
            console.log(result.data.sessionId);
            router.push('/dashboard/medicalAgent/'+result.data.sessionId);
          }
          setLoading(false);
    }
  return (
    <div className="flex flex-col items-center p-6 border rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow h-full">
      <div className="w-[80px] h-[80px] rounded-full bg-slate-200 overflow-hidden mb-4 relative shrink-0">
        {doctor?.image ? (
          <Image 
            src={doctor.image} 
            alt={doctor?.specialist || "Specialist"} 
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center">
            No Image
          </div>
        )}
      </div>
      
      <h2 className="font-bold text-lg text-center">
        Dr. {doctor?.specialist?.split(' ')[0] || "Specialist"}
      </h2>
      
      <p className="text-gray-600 text-sm mt-1 text-center">
        {doctor?.specialist || ""} {(doctor?.specialist || "").toLowerCase().includes('specialist') ? '' : 'Specialist'}
      </p>
      
      <p className="text-gray-500 text-xs mt-3 text-center">
        {doctor.description}
      </p>
      
      <Button className="flex items-center gap-2 mt-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium transition-colors" onClick={()=>onStartConsultation(doctor.defaultNote, doctor.specialist)} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 10C6 6.68629 8.68629 4 12 4C15.3137 4 18 6.68629 18 10C18 13.3137 15.3137 16 12 16C10.8202 16 9.71965 15.6606 8.78494 15.0805L4 16.5L4.99616 12.019A5.9547 5.9547 0 0 1 6 10Z"/>
          <path d="M16.9205 16.2995C18.1504 15.4244 19 14.0538 19 12.5C19 12.2642 18.9734 12.0345 18.9234 11.8122C19.6453 12.2783 20 13.0458 20 13.9C20 15.0874 19.3444 16.1424 18.3312 16.649L19.4975 19L16.4805 18.1568C15.7535 18.528 14.9126 18.785 14 18.785C13.238 18.785 12.522 18.6186 11.8841 18.3302C12.3025 18.0645 12.6841 17.7479 13.02 17.3876C14.197 17.7027 15.5414 17.5255 16.9205 16.2995Z"/>
        </svg>
        Start Consultation
      </Button>
    </div>
  )
}

export default DoctorAgentCard