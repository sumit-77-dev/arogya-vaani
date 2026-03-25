import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/config/OpenAIModel";
import { AIDoctorAgents } from "@/share/list";

export async function POST(request: NextRequest){
    const {notes} = await request.json();
    try{
        const completion = await openai.chat.completions.create({
            model: "nvidia/nemotron-3-super-120b-a12b:free",
            messages: [
                {role: 'system', content: JSON.stringify(AIDoctorAgents)},
                {role: 'user', content: `Based on the notes, suggest the best doctors: ${notes} return object in json only with all detail`}
            ],
        })

        const rawResponse = completion.choices[0].message.content || "{}";
        const cleanedResponse = rawResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const jsonResponse = JSON.parse(cleanedResponse);
        return NextResponse.json(jsonResponse);
    }catch(error){
        console.error(error);
        return NextResponse.json({error: 'Failed to suggest doctor'}, { status: 500 })
    }
}