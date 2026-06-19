import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sessonChatTable } from "@/config/schema";
import { uuidv7 } from 'uuidv7';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { openai } from "@/config/OpenAIModel";

export async function POST(req: NextRequest) {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();
    
    try {
        const result = await db.insert(sessonChatTable).values({
            sessionId: uuidv7(),
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            created_at_timestamp: new Date(),
        }).returning();
        return NextResponse.json(result[0]);
    }
    catch (e) {
        console.error("API ERROR:", e);
        return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionid = searchParams.get('sessionId');

    if (!sessionid) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    try {
        const result = await db.select().from(sessonChatTable).where(eq(sessonChatTable.sessionId, sessionid));
        return NextResponse.json(result[0] || null);
    } catch (e) {
        console.error("GET API ERROR:", e);
        return NextResponse.json({ error: "Failed to fetch session details" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionid = searchParams.get('sessionId');
        const { messages, action } = await req.json();

        if (!sessionid) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        // Fetch current session details
        const currentSession = await db.select().from(sessonChatTable).where(eq(sessonChatTable.sessionId, sessionid));
        if (currentSession.length === 0) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const session = currentSession[0];
        const selectedDoctor = session.selectedDoctor as any;
        const notes = session.notes;

        if (action === "generate_report") {
            // Generate report based on conversation
            const chatHistory = messages || session.conversation || [];
            
            const completion = await openai.chat.completions.create({
                model: "nvidia/nemotron-3-super-120b-a12b:free",
                messages: [
                    {
                        role: "system",
                        content: `You are a clinical assistant summarizer. Based on the conversation history between a patient and the AI Doctor (Dr. ${selectedDoctor?.specialist || "Specialist"}), generate a structured medical summary report. 
Do not diagnose definitively. State clearly that this is an AI-generated guidance report.
Respond ONLY with a valid JSON object matching this structure:
{
  "diagnosis": "Short summary of potential conditions discussed.",
  "symptoms": ["list", "of", "reported", "symptoms"],
  "recommendations": ["list", "of", "next", "steps", "lifestyle changes", "or remedies"],
  "warnings": ["emergency red flags when they must seek immediate in-person emergency care"]
}`
                    },
                    {
                        role: "user",
                        content: `Conversation History:\n${JSON.stringify(chatHistory, null, 2)}`
                    }
                ]
            });

            const rawContent = completion.choices[0].message.content || "{}";
            const cleanedContent = rawContent.replace(/```json/gi, '').replace(/```/gi, '').trim();
            
            let parsedReport;
            try {
                parsedReport = JSON.parse(cleanedContent);
            } catch (err) {
                console.error("Failed to parse report JSON, returning raw:", cleanedContent);
                parsedReport = {
                    diagnosis: "Clinical review summary.",
                    symptoms: ["Symptoms discussed in session"],
                    recommendations: ["Consult with an in-person physician."],
                    warnings: ["If symptoms worsen, please visit your local clinic or emergency room immediately."]
                };
            }

            // Save report to db
            await db.update(sessonChatTable)
                .set({ report: parsedReport })
                .where(eq(sessonChatTable.sessionId, sessionid));

            return NextResponse.json({ report: parsedReport });
        } else {
            // Regular chat action
            if (!messages || !Array.isArray(messages)) {
                return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
            }

            const systemPrompt = `${selectedDoctor?.agentPrompt || "You are a friendly medical assistant."} 
Patient context: Initial symptoms / notes: "${notes}". 
Rules: Keep responses short, empathetic, professional, and conversational (1 to 3 sentences max). This is vital because the response is read aloud. Avoid jargon.`;

            const completion = await openai.chat.completions.create({
                model: "nvidia/nemotron-3-super-120b-a12b:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ]
            });

            const reply = completion.choices[0].message;
            const updatedConversation = [...messages, reply];

            // Save conversation to db
            await db.update(sessonChatTable)
                .set({ conversation: updatedConversation })
                .where(eq(sessonChatTable.sessionId, sessionid));

            return NextResponse.json({ conversation: updatedConversation, reply });
        }
    } catch (e: any) {
        console.error("PUT API ERROR:", e);
        return NextResponse.json({ error: e.message || "Failed to update session" }, { status: 500 });
    }
}