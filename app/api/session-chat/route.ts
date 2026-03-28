import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sessonChatTable } from "@/config/schema";
import { uuidv7 } from 'uuidv7';
import {currentUser} from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
    const {notes, selectedDoctor} = await req.json();
    const user = await currentUser();
    
    try{
        const result = await db.insert(sessonChatTable).values({
            sessionId: uuidv7(),
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            created_at_timestamp: new Date(),
        }).returning();
        return NextResponse.json(result[0]);
    }
    catch(e){
        console.error("API ERROR:", e);
        return NextResponse.json({error: "Failed to start session"}, {status: 500});
    }
}