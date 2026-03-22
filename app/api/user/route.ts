import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {eq} from "drizzle-orm";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";   

export async function POST(request: NextRequest){
    const user = await currentUser();
    
    try{
       const email = user?.primaryEmailAddress?.emailAddress;

        if (!email) return;
        const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

        if(users.length === 0){
            const result = await db.insert(usersTable).values({
                name: user?.firstName || "Unknown",
                email: email,
                credit: 100,
                //@ts-ignore
            }).returning({ usersTable })
            return NextResponse.json(result[0]?.userTable);
        }

        return NextResponse.json(users[0]);

    }
    catch(e){
        return NextResponse.json(e);
    }
}