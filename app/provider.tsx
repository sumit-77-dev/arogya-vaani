"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";

export type UserDetail = {
  name: string;
  email: string;
  credit: number;
};

export const Provider = ({ children }: { children: React.ReactNode }) => {
    
     
    const [UserDetail, setUserDetail] = useState<UserDetail | null>(null);
    const CreateUser = async () => {   
        const result = await axios.post("/api/user");
        console.log(result.data);
        setUserDetail(result.data);
    }
    const {user} = useUser();
    useEffect(() => {
        user&&CreateUser();
    }, [user]);

  return (
    <>
        <div>
            <UserDetailContext.Provider value={{UserDetail, setUserDetail}}>
            {children}
            </UserDetailContext.Provider>
        </div>
    </>
  )
};