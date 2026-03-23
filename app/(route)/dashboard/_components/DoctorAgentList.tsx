import React from 'react'
import Image from 'next/image'
import { AIDoctorAgents } from '@/share/list'
import DoctorAgentCard from './DoctorAgentCard'

function DoctorAgentList() {
  return (
    <div className='mt-5'>
        <h2 className='font-bold text-2xl'>AI specialist doctors</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5'>
            {AIDoctorAgents.map((doctor,index)=>(
                <DoctorAgentCard key={index} doctor={doctor} />
            ))}
        </div>
    </div>
  )
}

export default DoctorAgentList