"use client"

import {HeroSectionOne} from "@/components/hero-section-demo-1";
import {useUser} from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const user = useUser();
  if(user.isSignedIn){
    redirect('/dashboard');
  }
  return (
    <>
      <HeroSectionOne />
    </>
  );
}
