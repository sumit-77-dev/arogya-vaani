"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { AddNewSessionDialog } from './AddNewSessionDialog'

function HistoryList() {
    const [HistoryList, setHistory] = useState([]);
  return (
    <div>
        {HistoryList.length === 0 ?
         <div className='flex flex-col items-center mt-10 border border-dashed border-gray-300 rounded-2xl p-10'>
          <Image src={'/medical-assistance.png'} alt='medical-assistant' width={150} height={150} />
          <h2 className='font-bold mt-3'>No recent consultations</h2>
          <p className='mt-3'>Start your first consultation to see your history here</p>
          <AddNewSessionDialog />
        </div>:

        <div>List</div> 
    }
    </div>
  )
}

export default HistoryList