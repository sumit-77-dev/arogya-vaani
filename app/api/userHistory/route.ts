import { db } from "@/config/db";
import { sessonChatTable } from "@/config/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {currentUser} from "@clerk/nextjs/server"

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress;
        if(!email){
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const history = await db.select().from(sessonChatTable).where(eq(sessonChatTable.createdBy, email)).execute();
        
        return NextResponse.json(history);
    } catch (error) {
        console.log(error);
    }
}
