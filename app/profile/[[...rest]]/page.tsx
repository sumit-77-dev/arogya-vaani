"use client";

import { UserProfile } from "@clerk/nextjs";

export default function Profile() {
    return <>
        <div className="flex flex-col justify-center items-center py-10">
            <UserProfile />
        </div>  
    </>
}