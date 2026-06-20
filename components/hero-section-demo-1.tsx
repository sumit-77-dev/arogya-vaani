"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { 
  Mic, 
  Users, 
  ClipboardCopy, 
  Sparkles, 
  Globe, 
  Clock, 
  HeartPulse, 
  Stethoscope 
} from "lucide-react";


export  function HeroSectionOne() {
  const [activeTab, setActiveTab] = useState<'features' | 'audience'>('features');
  

  const features = [
    {
      title: "Voice-First Diagnosis",
      description: "Describe symptoms in Hindi, Hinglish, or English. The AI listens, transcribes, and understands naturally.",
      icon: Mic,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    {
      title: "Specialized AI Doctors",
      description: "Consult General Physicians, Pediatricians, Cardiologists, and Gynecologists, custom-tuned to medical protocols.",
      icon: Stethoscope,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Structured Clinical Reports",
      description: "Get structured summaries of symptoms, tentative diagnoses, recommendations, and emergency red flags.",
      icon: ClipboardCopy,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
    },
    {
      title: "Smart Suggestions",
      description: "Get immediate recommendations for physical specialist consulting based on the severity of symptoms.",
      icon: Sparkles,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
    },
  ];

  const audiences = [
    {
      title: "Elderly Citizens",
      description: "No typing required. Just press the mic button, speak like you would to a family doctor, and listen to spoken advice.",
      icon: Users,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400",
    },
    {
      title: "Rural & Hindi Speakers",
      description: "Designed for vernacular audiences. Understands colloquial expressions, local terms, and conversational Hindi/Hinglish.",
      icon: Globe,
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400",
    },
    {
      title: "Busy Professionals",
      description: "Perform quick preliminary health checks in minutes. Access session histories anytime to track health status.",
      icon: Clock,
      color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400",
    },
    {
      title: "Parents & Caregivers",
      description: "Quickly screen common pediatric issues or get basic medical guidance for dependents at any time of day.",
      icon: HeartPulse,
      color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400",
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20 w-full flex flex-col items-center">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Aap ka doctor, ab aapki awaaz par"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          Chahe chhoti si pareshaani ho ya health concern, bas boliye. Arogya Vaani aapko turant samajhkar sahi margdarshan deti hai.</motion.p>
        <Link href="/sign-in">
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="w-60 transform rounded-lg bg-[#5cac94] hover:bg-[#4a9680] px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#5cac94]/20 hover:shadow-lg hover:shadow-[#5cac94]/30">
            Explore Now
          </button>
        </motion.div>
        </Link>
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="mt-16 w-full max-w-4xl mx-auto px-4 relative z-20"
        >
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-5 py-2.5 rounded-full font-semibold text-xs md:text-sm transition-all duration-300 cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-[#5cac94] text-white shadow-md shadow-[#5cac94]/25 scale-105'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 dark:text-neutral-300'
              }`}
            >
              Key Features
            </button>
            <button
              onClick={() => setActiveTab('audience')}
              className={`px-5 py-2.5 rounded-full font-semibold text-xs md:text-sm transition-all duration-300 cursor-pointer ${
                activeTab === 'audience'
                  ? 'bg-[#5cac94] text-white shadow-md shadow-[#5cac94]/25 scale-105'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 dark:text-neutral-300'
              }`}
            >
              Who Can Use It?
            </button>
          </div>

          <div className="relative min-h-[360px] md:min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {(activeTab === 'features' ? features : audiences).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="group relative flex gap-4 p-4 rounded-xl border border-neutral-200 bg-white/40 dark:bg-neutral-900/40 dark:border-neutral-800 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-[#5cac94]/30 hover:-translate-y-0.5"
                    >
                      <div className={`flex items-center justify-center w-11 h-11 rounded-lg shrink-0 ${item.color} transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="w-5.5 h-5.5" />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">
                          {item.title}
                        </h3>
                        <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export const Navbar = () => {
  const user = useUser();
  
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <Image src="/logo.svg" alt="logo" width={40} height={40} />
        <h1 className='font-bold text-2xl text-[#5cac94]'>Arogya <span className='text-primary'>Vaani</span></h1>
      </div>
      {!user.isSignedIn ? 
          <Button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            <Link href="/sign-in">Sign In</Link>
          </Button>  :
          <div className="flex gap-5 items-center">
            <UserButton 
              appearance={{
                  elements: {
                    userButtonPopoverCard: "font-sans-serif",
                    userButtonPopoverMain: "font-sans-serif",
                    userButtonPopoverActionButton: "font-sans-serif",
                    userButtonPopoverActionButtonText: "font-sans-serif",
                    userButtonPopoverFooter: "font-sans-serif",
                  },
                }}
            />
            <Button  className={"flex items-center justify-center font-sans-serif"} ><Link href="/dashboard">Dashboard</Link></Button>
          </div>
  }
    </nav>
  );
};
