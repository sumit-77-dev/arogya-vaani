import React from 'react'
import { Doctor } from './DoctorAgentCard'
import Image from 'next/image'

interface SuggestDoctorCardProps {
  doctor: Doctor;
  setSelectedDoctor: (doctor: Doctor) => void;  
  selectedDoctor?: Doctor;
}
function SuggestDoctorCard({doctor, setSelectedDoctor, selectedDoctor}:SuggestDoctorCardProps) {
  return (
    <div className={`flex items-center flex-col w-[200px] border border-2xl shadow-sm rounded-2xl p-2 
        hover:shadow-md transition-shadow cursor-pointer ${selectedDoctor?.id === doctor.id ? 'border-blue-500' : ''}`} onClick={() => setSelectedDoctor(doctor)}>
        {doctor?.image ? (
          <Image 
              src={doctor.image} 
              alt={doctor?.specialist || 'Doctor'} 
              width={70}
              height={70}
              className='w-[70px] h-[70px] rounded-full object-cover'
          />
        ) : (
          <div className='w-[70px] h-[70px] rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs text-center font-medium'>
            No Image
          </div>
        )}
        <h2 className='font-bold text-sm mb-2 text-center'>Dr. {doctor.specialist}</h2>
        <p className='text-xs mb-2 text-center line-clamp-2'>{doctor.description}</p>
    </div>
  )
}

export default SuggestDoctorCard