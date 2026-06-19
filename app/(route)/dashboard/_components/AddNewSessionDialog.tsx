'use client'
import {Loader2} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { Doctor } from "./DoctorAgentCard"
import SuggestDoctorCard from "./SuggestDoctorCard"
import { useRouter } from "next/navigation"

export function AddNewSessionDialog() {
    const router = useRouter();
    const [note, setNote] = useState<string>('')
    const [loading, setLoading] = useState(false);
    const [suggestDoctor, setSuggestDoctor] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor>();
    const OnClickNext = async () => {
        setLoading(true);
        try {
            const result = await axios.post('/api/suggest-doctor', {notes: note});
            console.log(result.data);
            
            if (Array.isArray(result.data)) {
                setSuggestDoctor(result.data);
            } else if (result.data && Object.keys(result.data).length > 0) {
                setSuggestDoctor([result.data]);
            } else {
                setSuggestDoctor([]);
            }
        } catch (error) {
            console.error("Failed to suggest doctor. Please try again.", error);
        } finally {
            setLoading(false);
        }
    }

    const  onStartConsultation = async() => {
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
    <Dialog>
      <DialogTrigger render={<Button className={'mt-4'} />}>
        + Start Consultation
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>Add Basic Information</DialogTitle>
        </DialogHeader>
        {suggestDoctor.length==0?<div>
          <h2 className="text-sm font-small">Add Symtoms or Any Other Information</h2>
            <Textarea placeholder="Add details here...." className='mt-4' onChange={(e)=>setNote(e.target.value)} />
        </div>:<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto'>
          {suggestDoctor.map((doctor, index)=>(<SuggestDoctorCard doctor={doctor} key={index} 
            setSelectedDoctor={() => setSelectedDoctor(doctor)}
            selectedDoctor={selectedDoctor}/>))}
        </div>}
        <DialogFooter>
            <DialogClose render={<Button variant={'outline'} />}>
                Cancel
            </DialogClose>
            {suggestDoctor.length==0?<Button disabled={!note || loading} onClick={() => OnClickNext()}>
              {loading ? <Loader2 className={('animate-spin')}/>:<span>Next</span>} <ArrowRight />
            </Button>:
            <Button disabled={!note || loading} onClick={() => onStartConsultation()}>
              {loading ? <Loader2 className={('animate-spin')}/>:<span>Start Consultation</span>} <ArrowRight />
            </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
