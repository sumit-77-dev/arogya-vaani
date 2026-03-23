'use client'

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


export function AddNewSessionDialog() {
    const [note, setNote] = useState<string>('')
  return (
    <Dialog>
      <DialogTrigger>
        <Button className={'mt-4'}>+ Start Consultation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Information</DialogTitle>
          <DialogDescription>
            Add Symtoms or Any Other Information
          </DialogDescription>
        </DialogHeader>
        <div>
            <Textarea placeholder="Add details here...." className='mt-4' onChange={(e)=>setNote(e.target.value)} />
        </div>
        <DialogFooter>
            <DialogClose>
                <Button variant={'outline'}>Cancel</Button>
            </DialogClose>
            <Button disabled={!note}>Next <ArrowRight /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
