"use client"

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Doctor } from '../../_components/DoctorAgentCard';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Printer, 
  Loader2, 
  ArrowLeft,
  User,
  HeartPulse
} from 'lucide-react';

type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  conversation?: Message[];
  report: any;
  selectedDoctor: Doctor;
  createdOn: string;
}

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SpeechRecognition = typeof window !== 'undefined' 
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) 
  : null;

function MedicalVoiceAgent() {
  const params = useParams();
  const router = useRouter();
  const { sessionId } = params;
  
  const [sessionDetails, setSessionDetails] = useState<SessionDetail>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiProcessing, setAiProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showReport, setShowReport] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasInitialized = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Fetch session details
  const GetSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await axios.get('/api/session-chat?sessionId=' + sessionId);
      if (result.data) {
        setSessionDetails(result.data);
      } else {
        setError("Session details not found.");
      }
    } catch (e: any) {
      console.error("API Error: ", e.message);
      setError("Failed to load session details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      GetSessionDetails();
    }
  }, [sessionId]);

  // Voice synthesis helper
  const speak = (text: string) => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, more clinical pace
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      if (enVoices.length > 0) {
        // Find default/female/male voice preferred by doctor style if desired
        // A gentle, high quality local voice is fallback
        const doctorVoice = enVoices.find(v => 
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('natural')
        ) || enVoices[0];
        
        utterance.voice = doctorVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // Setup initial message greeting
  useEffect(() => {
    if (sessionDetails && !hasInitialized.current) {
      hasInitialized.current = true;
      const dbConv = sessionDetails.conversation;
      if (dbConv && dbConv.length > 0) {
        setMessages(dbConv);
      } else {
        const docName = sessionDetails.selectedDoctor?.specialist?.split(' ')[0] || "Specialist";
        const doctorGreeting = `Hello, I am Dr. ${docName}. I've read the notes you provided regarding: "${sessionDetails.notes}". How are you feeling today, and what symptoms are you experiencing?`;
        
        const initialMsgs: Message[] = [{ role: 'assistant', content: doctorGreeting }];
        setMessages(initialMsgs);
        speak(doctorGreeting);

        // Save initial greeting to DB
        axios.put(`/api/session-chat?sessionId=${sessionId}`, {
          messages: initialMsgs
        }).catch(err => console.error("Failed to save initial greeting:", err));
      }

      if (sessionDetails.report) {
        setShowReport(true);
      }
    }
  }, [sessionDetails]);

  // Scroll to bottom on message change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition (Voice Input) setup
  const startListening = () => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log("Speech Recognition: Started listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech Recognition: Transcript captured:", transcript);
        if (transcript && transcript.trim() !== '') {
          setInputText(transcript);
          sendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.log("Speech Recognition: Error event received:", event.error);
        if (event.error !== 'no-speech') {
          console.error("Speech Recognition Error:", event.error);
          setError(`Speech input error: ${event.error}`);
        } else {
          console.log("Speech Recognition info: No speech detected (timeout).");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log("Speech Recognition: Connection closed.");
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error("Speech Recognition: Initialization error:", err);
      setError("Failed to start voice recognition.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Send message
  const sendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim()) return;

    console.log("sendMessage called with text:", text);
    const newUserMsg: Message = { role: 'user', content: text };
    const updatedMsgs = [...messagesRef.current, newUserMsg];
    
    // Update local state first for real-time response
    setMessages(updatedMsgs);
    setInputText('');
    setAiProcessing(true);
    setError(null);

    // Cancel speech if user interrupts
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      console.log("Sending request to API with message history:", updatedMsgs);
      const result = await axios.put(`/api/session-chat?sessionId=${sessionId}`, {
        messages: updatedMsgs
      });

      if (result.data && result.data.conversation) {
        console.log("API response received:", result.data);
        setMessages(result.data.conversation);
        const doctorReply = result.data.reply?.content || '';
        if (doctorReply) {
          speak(doctorReply);
        }
      }
    } catch (err: any) {
      console.error("Failed to send message to AI Doctor:", err);
      setError(err.response?.data?.error || "Error connecting to AI specialist. Please try again.");
    } finally {
      setAiProcessing(false);
    }
  };

  // End consultation & generate summary report
  const endConsultation = async () => {
    setLoading(true);
    setAiProcessing(true);
    setError(null);
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const response = await axios.put(`/api/session-chat?sessionId=${sessionId}`, {
        messages: messages,
        action: 'generate_report'
      });
      
      if (response.data?.report) {
        setSessionDetails(prev => prev ? { ...prev, report: response.data.report } : prev);
        setShowReport(true);
        setSuccess("Consultation completed! Medical report generated.");
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (e: any) {
      console.error("Failed to generate medical report:", e);
      setError("Failed to compile final report. Please try ending again.");
    } finally {
      setLoading(false);
      setAiProcessing(false);
    }
  };

  // Toggle mute voice output
  const toggleMute = () => {
    if (!isMuted) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    setIsMuted(!isMuted);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading && !sessionDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="w-12 h-12 text-[#5cac94] animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">Initializing Medical Voice Session...</p>
      </div>
    );
  }

  const doctor = sessionDetails?.selectedDoctor;

  return (
    <div className="max-w-6xl mx-auto my-6 px-2">
      {/* Back button and status banner */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        {success && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {error}
          </div>
        )}
      </div>

      {!showReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Specialist Doctor Info & Control Center */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              {/* Doctor Avatar / Illustration */}
              <div className="w-[110px] h-[110px] rounded-full border-4 border-slate-50 overflow-hidden shadow-inner relative mb-4 shrink-0 bg-slate-100">
                {doctor?.image ? (
                  <Image 
                    src={doctor.image} 
                    alt={doctor.specialist} 
                    fill 
                    className="object-cover"
                    sizes="110px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Doctor Title */}
              <h2 className="font-bold text-xl text-slate-800">
                Dr. {doctor?.specialist?.split(' ')[0] || "Specialist"}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                AI {doctor?.specialist || ""} Specialist
              </p>

              {/* Consultation Active Indicator */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold mt-3.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live consultation active
              </div>

              <div className="w-full border-t border-slate-100 my-5" />

              {/* Doctor Bio Details */}
              <div className="w-full space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expertise & Scope</h4>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">{doctor?.description}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#5cac94]" /> 
                    Patient Intake Context
                  </h4>
                  <p className="text-slate-600 text-xs mt-1.5 line-clamp-3 leading-relaxed italic">
                    &quot;{sessionDetails?.notes || "No patient notes available."}&quot;
                  </p>
                </div>
              </div>

              <div className="w-full border-t border-slate-100 my-5" />

              {/* Actions Box */}
              <div className="w-full space-y-3">
                <button 
                  onClick={toggleMute}
                  className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    isMuted 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {isMuted ? "Unmute Doctor Voice" : "Mute Doctor Voice"}
                </button>

                <button 
                  onClick={endConsultation}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  Complete Consultation
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Conversation Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[600px] overflow-hidden">
              
              {/* Conversation Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#5cac94]" />
                    Interactive Consultation Window
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Your conversation history with Dr. {doctor?.specialist?.split(' ')[0]}</p>
                </div>
                
                {/* Voice Animation waves */}
                {aiProcessing && (
                  <div className="flex items-center gap-1.5" title="Doctor is analyzing...">
                    <span className="text-slate-400 text-xs font-medium mr-1.5 animate-pulse">Doctor is typing</span>
                    <div className="w-1.5 h-3 bg-[#5cac94] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-5 bg-[#5cac94] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-4 bg-[#5cac94] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                )}
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3`}
                    >
                      {/* Avatar for Doctor in logs */}
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 relative bg-slate-100 shrink-0 mt-1">
                          {doctor?.image ? (
                            <Image 
                              src={doctor.image} 
                              alt="Doctor" 
                              fill 
                              className="object-cover" 
                              sizes="32px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Bubble content */}
                      <div 
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm max-w-[75%] ${
                          isUser 
                            ? 'bg-[#5cac94] text-white rounded-tr-none' 
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  );
                })}

                {/* AI processing bouncing dots */}
                {aiProcessing && (
                  <div className="flex justify-start items-start gap-3">
                    <div className="w-8 h-8 rounded-full border border-slate-200 relative bg-slate-100 shrink-0 mt-1 flex items-center justify-center text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-[#5cac94]" />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1 shadow-sm">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Speech recognition active visual feedback bar */}
              {isListening && (
                <div className="px-6 py-2.5 bg-red-50 border-t border-red-100 flex items-center justify-between animate-pulse shrink-0">
                  <div className="flex items-center gap-2 text-red-700 text-xs font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    Microphone is open - Dr. {doctor?.specialist?.split(' ')[0]} is listening...
                  </div>
                  <button 
                    onClick={stopListening}
                    className="text-xs text-red-600 hover:text-red-800 underline font-semibold cursor-pointer"
                  >
                    Cancel Voice
                  </button>
                </div>
              )}

              {/* Chat Input Footer Controls */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3.5 rounded-full transition-all cursor-pointer relative shrink-0 shadow-sm ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white ring-4 ring-red-100 scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                  }`}
                  title={isListening ? "Stop voice listening" : "Talk via Voice"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Input Text Box */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder={isListening ? "Listening... start speaking..." : "Describe symptoms, ask follow-up questions..."}
                  disabled={isListening || aiProcessing}
                  className="flex-1 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cac94]/30 transition-all text-slate-800 placeholder-slate-400"
                />

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!inputText.trim() || aiProcessing || isListening}
                  className="p-3.5 bg-[#5cac94] hover:bg-[#4a9680] text-white rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* Report Summary Section */
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-md max-w-4xl mx-auto my-4 animate-fade-in relative print:p-0 print:border-none print:shadow-none">
          
          {/* Watermark/Heart icon */}
          <div className="absolute right-8 top-8 opacity-5 print:hidden">
            <HeartPulse className="w-32 h-32 text-[#5cac94]" />
          </div>

          {/* Action buttons on Top */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6 print:hidden">
            <div>
              <h2 className="font-bold text-2xl text-slate-800">Clinical Consultation Summary</h2>
              <p className="text-slate-400 text-xs mt-0.5">Reference ID: {sessionId}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowReport(false)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-all"
              >
                Return to Chat
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#5cac94] hover:bg-[#4a9680] text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
            </div>
          </div>

          {/* Printable Document Design */}
          <div className="space-y-6">
            
            {/* Logo/Clinic Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="logo" width={32} height={32} />
                <h1 className="font-bold text-xl text-[#5cac94]">Arogya <span className="text-slate-800">Vaani</span></h1>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Medical Record</span>
                <p className="text-slate-700 text-xs font-bold mt-0.5">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Quick Context Details block */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm">
              <div>
                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block">Assigned Doctor</span>
                <span className="text-slate-700 font-bold text-sm block mt-0.5">Dr. {doctor?.specialist || "Clinical Specialist"}</span>
                <span className="text-slate-500 text-xs">AI Specialist Medical Assistant</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider block">Original Intake Notes</span>
                <span className="text-slate-700 font-medium text-xs block mt-0.5 italic line-clamp-2">&quot;{sessionDetails?.notes || "Not specified"}&quot;</span>
              </div>
            </div>

            {/* Report Content Blocks */}
            <div className="space-y-5">
              {/* AI Clinical Insights */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#5cac94]" />
                  AI Clinical Insights / Summary
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-6">
                  {sessionDetails?.report?.diagnosis || "Consultation review in progress."}
                </p>
              </div>

              {/* Reported Symptoms */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5cac94]" />
                  Symptoms Evaluated
                </h3>
                <div className="flex flex-wrap gap-2 pl-6">
                  {sessionDetails?.report?.symptoms && Array.isArray(sessionDetails.report.symptoms) ? (
                    sessionDetails.report.symptoms.map((symptom: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                        {symptom}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm italic">Intake notes provided at start.</span>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5cac94]" />
                  Consultation Recommendations
                </h3>
                <ul className="space-y-2 pl-6 text-sm text-slate-600">
                  {sessionDetails?.report?.recommendations && Array.isArray(sessionDetails.report.recommendations) ? (
                    sessionDetails.report.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#5cac94] mt-1 shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic">Review clinical advice with an in-person general practitioner.</li>
                  )}
                </ul>
              </div>

              {/* Warnings / Emergency Red Flags */}
              <div className="space-y-2 p-4 bg-rose-50 border border-rose-100 rounded-xl">
                <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Clinical Disclaimer & Emergency Warnings
                </h3>
                <ul className="space-y-1.5 pl-6 text-xs text-rose-700 leading-relaxed list-disc">
                  {sessionDetails?.report?.warnings && Array.isArray(sessionDetails.report.warnings) ? (
                    sessionDetails.report.warnings.map((warn: string, i: number) => (
                      <li key={i}>{warn}</li>
                    ))
                  ) : (
                    <li>If you experience difficulty breathing, chest tightness, severe pain, or bleeding, please contact your local emergency services (e.g. 911 / 112) immediately.</li>
                  )}
                  <li className="font-bold mt-1 list-none -ml-4">
                    Disclaimer: This report is generated by an artificial intelligence assistant for informational guidelines only. It is NOT a professional medical diagnosis, prescription, or clinical opinion.
                  </li>
                </ul>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-slate-100 flex justify-between text-xs text-slate-400">
              <p>Certified by Arogya Vaani AI Platform</p>
              <p className="text-right">Consultation Session ID: {sessionId}</p>
            </div>

          </div>

          {/* Printable Return Dashboard controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center print:hidden">
            <Link href="/dashboard">
              <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                Return to Dashboard Home
              </button>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
