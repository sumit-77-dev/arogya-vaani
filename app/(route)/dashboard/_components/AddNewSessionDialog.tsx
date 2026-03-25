'use client'
import {Loader2} from 'lucide-react'
import {cn} from '@/lib/utils'
import DoctorAgentCard from './DoctorAgentCard'

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

export function AddNewSessionDialog() {
    const [note, setNote] = useState<string>('')
    const [loading, setLoading] = useState(false);
    const [suggestDoctor, setSuggestDoctor] = useState<Doctor[]>([]);
    const OnClickNext = async () => {
        setLoading(true);
        const result = await axios.post('/api/suggest-doctor', {notes: note});
        console.log(result.data);
        setSuggestDoctor([result.data]);
        setLoading(false);
    }
  return (
    <Dialog>
      <DialogTrigger render={<Button className={'mt-4'} />}>
        + Start Consultation
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Information</DialogTitle>
        </DialogHeader>
        {suggestDoctor.length==0?<div>
          <h2 className="text-sm font-small">Add Symtoms or Any Other Information</h2>
            <Textarea placeholder="Add details here...." className='mt-4' onChange={(e)=>setNote(e.target.value)} />
        </div>:<div className='grid grid-cols-2 gap-5'>
          {suggestDoctor.map((doctor, index)=>(<DoctorAgentCard key={index} doctor={doctor} />))}
        </div>}
        <DialogFooter>
            <DialogClose render={<Button variant={'outline'} />}>
                Cancel
            </DialogClose>
            {suggestDoctor.length==0?<Button disabled={!note || loading} onClick={() => OnClickNext()}>
              {loading ? <Loader2 className={('animate-spin')}/>:<span>Next</span>} <ArrowRight />
            </Button>:
            <Button disabled={!note} onClick={() => OnClickNext()}>
              Start Consultation <ArrowRight />
            </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
