import React from 'react'

async function MedicalVoiceAgent({params} : {params: Promise<{sessionId: string}>}) {
  const {sessionId} = await params;
  return (
    <div className='mt-4'>
        <h1>Medical Voice Agent</h1>
        <p>Session ID: {sessionId}</p>
    </div>
  )
}

export default MedicalVoiceAgent